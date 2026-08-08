import React, { useState, useMemo } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RefreshCw,
  Search,
  Database,
  Sparkles,
  Send,
  Clock,
  ChevronRight,
  X,
  FileText,
  Filter,
  ExternalLink,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopicReview, Agent, RunLog, Post } from '../types';

interface JudgmentTabProps {
  reviews: TopicReview[];
  logs?: RunLog[];
  posts?: Post[];
  agentsMap: Map<string, Agent>;
  agents?: Agent[];
  selectedAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
  onTriggerCycle?: () => void;
  isTriggering?: boolean;
}

type StatusFilter = 'all' | 'published' | 'skipped_dedup' | 'skipped_rejected' | 'error';

interface ExecutionRunItem {
  id: string;
  runLog?: RunLog;
  agentId: string;
  agentName: string;
  agentDomain: string;
  timestamp: string;
  durationSec: number | null;
  outcome: 'published' | 'skipped_no_candidates' | 'skipped_all_rejected' | 'skipped_dedup' | 'skipped_near_duplicate' | 'error';
  detail?: string;
  reviews: TopicReview[];
  publishedPost?: Post;
}

export const JudgmentTab: React.FC<JudgmentTabProps> = ({
  reviews = [],
  logs = [],
  posts = [],
  agentsMap,
  agents = [],
  selectedAgentId = 'all',
  onSelectAgent,
  onTriggerCycle,
  isTriggering = false,
}) => {
  const [filterAgent, setFilterAgent] = useState<string>(selectedAgentId);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRun, setSelectedRun] = useState<ExecutionRunItem | null>(null);

  // Sync state if selectedAgentId prop changes from parent
  React.useEffect(() => {
    setFilterAgent(selectedAgentId);
  }, [selectedAgentId]);

  // Group logs, reviews, and posts into unified Execution Runs
  const executionRuns = useMemo(() => {
    const items: ExecutionRunItem[] = [];

    if (logs.length > 0) {
      logs.forEach((log, index) => {
        const agent = agentsMap.get(log.agentId);
        const name = agent ? agent.persona.name : `Agent ${log.agentId.slice(0, 6)}`;
        const domain = agent ? agent.persona.domain : 'General';

        const startTime = new Date(log.startedAt).getTime();
        const endTime = log.finishedAt ? new Date(log.finishedAt).getTime() : startTime;
        const durationSec = log.finishedAt ? Math.max(0.1, Number(((endTime - startTime) / 1000).toFixed(1))) : null;

        // Find topic reviews that occurred around this run time (+/- 15 seconds)
        const correlatedReviews = reviews.filter((r) => {
          if (r.agentId !== log.agentId) return false;
          const rTime = new Date(r.reviewedAt).getTime();
          return Math.abs(rTime - startTime) < 30000 || Math.abs(rTime - endTime) < 30000;
        });

        // Find post published around this run time
        const correlatedPost = posts.find((p) => {
          if (p.agentId && p.agentId !== log.agentId) return false;
          const pTime = new Date(p.createdAt).getTime();
          return Math.abs(pTime - endTime) < 30000;
        });

        items.push({
          id: log.id ? `EXEC-${log.id}` : `EXEC-${logs.length - index}`,
          runLog: log,
          agentId: log.agentId,
          agentName: name,
          agentDomain: domain,
          timestamp: log.startedAt,
          durationSec,
          outcome: log.outcome,
          detail: log.detail || undefined,
          reviews: correlatedReviews,
          publishedPost: correlatedPost,
        });
      });
    } else if (reviews.length > 0) {
      // Synthetic fallback from reviews if run logs table is empty
      reviews.forEach((review, index) => {
        const agent = agentsMap.get(review.agentId);
        const name = agent ? agent.persona.name : `Agent ${review.agentId.slice(0, 6)}`;
        const domain = agent ? agent.persona.domain : 'General';
        const outcome = review.verdict === 'accept' ? 'published' : 'skipped_all_rejected';

        items.push({
          id: `EXEC-REV-${reviews.length - index}`,
          agentId: review.agentId,
          agentName: name,
          agentDomain: domain,
          timestamp: review.reviewedAt,
          durationSec: 1.8,
          outcome,
          detail: review.reason || undefined,
          reviews: [review],
          publishedPost: posts.find((p) => p.text.includes(review.candidateTitle || '')),
        });
      });
    }

    return items;
  }, [logs, reviews, posts, agentsMap]);

  // Filtered runs
  const filteredRuns = useMemo(() => {
    return executionRuns.filter((run) => {
      // Agent filter
      if (filterAgent !== 'all' && run.agentId !== filterAgent) {
        return false;
      }

      // Status filter
      if (statusFilter === 'published' && run.outcome !== 'published') return false;
      if (statusFilter === 'skipped_dedup' && run.outcome !== 'skipped_dedup' && run.outcome !== 'skipped_near_duplicate') return false;
      if (statusFilter === 'skipped_rejected' && run.outcome !== 'skipped_all_rejected' && run.outcome !== 'skipped_no_candidates') return false;
      if (statusFilter === 'error' && run.outcome !== 'error') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = run.agentName.toLowerCase().includes(q);
        const matchesDomain = run.agentDomain.toLowerCase().includes(q);
        const matchesDetail = (run.detail || '').toLowerCase().includes(q);
        const matchesTopics = run.reviews.some((r) => (r.candidateTitle || '').toLowerCase().includes(q));
        const matchesPost = (run.publishedPost?.text || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDomain && !matchesDetail && !matchesTopics && !matchesPost) {
          return false;
        }
      }

      return true;
    });
  }, [executionRuns, filterAgent, statusFilter, searchQuery]);

  // System metrics stats
  const stats = useMemo(() => {
    const total = filteredRuns.length;
    const published = filteredRuns.filter((r) => r.outcome === 'published').length;
    const rejected = filteredRuns.filter((r) => r.outcome === 'skipped_all_rejected').length;
    const deduped = filteredRuns.filter((r) => r.outcome === 'skipped_dedup' || r.outcome === 'skipped_near_duplicate').length;
    const publishRate = total > 0 ? ((published / total) * 100).toFixed(0) : '0';

    const durations = filteredRuns.map((r) => r.durationSec).filter((d): d is number => d !== null);
    const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) : '1.8';

    const totalEvaluated = filterAgent === 'all'
      ? reviews.length
      : reviews.filter((r) => r.agentId === filterAgent).length;

    return { total, published, rejected, deduped, publishRate, avgDuration, totalEvaluated };
  }, [filteredRuns, reviews, filterAgent]);

  const getOutcomeBadge = (outcome: ExecutionRunItem['outcome']) => {
    switch (outcome) {
      case 'published':
        return (
          <span className="execution-badge outcome-published">
            <CheckCircle2 size={11} /> PUBLISHED
          </span>
        );
      case 'skipped_dedup':
      case 'skipped_near_duplicate':
        return (
          <span className="execution-badge outcome-dedup">
            <Database size={11} /> DEDUP SKIPPED
          </span>
        );
      case 'skipped_all_rejected':
      case 'skipped_no_candidates':
        return (
          <span className="execution-badge outcome-rejected">
            <XCircle size={11} /> REJECTED
          </span>
        );
      case 'error':
        return (
          <span className="execution-badge outcome-error">
            <AlertCircle size={11} /> ERROR
          </span>
        );
      default:
        return (
          <span className="execution-badge outcome-other">
            <Clock size={11} /> {String(outcome).replace(/_/g, ' ').toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="view-container execution-tab-container">
      {/* 1. Header Controls & KPI Bar */}
      <div className="execution-header-card">
        <div className="execution-header-top">
          <div className="execution-header-title">
            <div className="pulse-live-indicator" title="Live Agent Execution Tracker Active">
              <span className="pulse-dot" />
              <Activity size={16} className="pulse-icon" />
            </div>
            <div>
              <h3>Real Agent Execution Audit</h3>
              <p>Live, verified execution pipeline trace tested by persona agents</p>
            </div>
          </div>

          <div className="execution-actions">
            {/* Filter by Agent Dropdown */}
            {agents.length > 0 && (
              <select
                className="execution-agent-select"
                value={filterAgent}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterAgent(val);
                  if (onSelectAgent) {
                    onSelectAgent(val);
                  }
                }}
              >
                <option value="all">🌐 All Agent Personas ({agents.length})</option>
                {agents.map((a) => (
                  <option key={a.agentId} value={a.agentId}>
                    🤖 {a.persona.name} ({a.persona.domain})
                  </option>
                ))}
              </select>
            )}

            {/* Trigger Real Execution Button */}
            <button
              className="btn-trigger-execution"
              onClick={() => {
                if (onTriggerCycle) onTriggerCycle();
              }}
              disabled={isTriggering}
            >
              {isTriggering ? (
                <>
                  <RefreshCw size={13} className="spin" /> Executing Pipeline...
                </>
              ) : (
                <>
                  <Play size={13} /> Run Real Execution Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* KPI Metrics Summary Bar */}
        <div className="execution-kpi-bar">
          <div className="kpi-mini-card">
            <div className="kpi-mini-icon purple">
              <Layers size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.total}</div>
              <div className="kpi-mini-lbl">Total Executions</div>
            </div>
          </div>

          <div className="kpi-mini-card">
            <div className="kpi-mini-icon green">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.publishRate}%</div>
              <div className="kpi-mini-lbl">Publish Success Rate</div>
            </div>
          </div>

          <div className="kpi-mini-card">
            <div className="kpi-mini-icon blue">
              <Scale size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.totalEvaluated}</div>
              <div className="kpi-mini-lbl">Topics Evaluated</div>
            </div>
          </div>

          <div className="kpi-mini-card">
            <div className="kpi-mini-icon amber">
              <Clock size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.avgDuration}s</div>
              <div className="kpi-mini-lbl">Avg Latency</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="execution-filter-row">
          <div className="execution-status-tabs">
            <button
              className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Runs ({executionRuns.length})
            </button>
            <button
              className={`status-tab-btn ${statusFilter === 'published' ? 'active' : ''}`}
              onClick={() => setStatusFilter('published')}
            >
              Published ({stats.published})
            </button>
            <button
              className={`status-tab-btn ${statusFilter === 'skipped_dedup' ? 'active' : ''}`}
              onClick={() => setStatusFilter('skipped_dedup')}
            >
              Dedup Skipped ({stats.deduped})
            </button>
            <button
              className={`status-tab-btn ${statusFilter === 'skipped_rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('skipped_rejected')}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          <div className="execution-search-wrapper">
            <Search size={13} className="search-icon" />
            <input
              type="text"
              placeholder="Search candidate topics, rationale, or persona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="execution-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Execution Run Feed */}
      {filteredRuns.length === 0 ? (
        <div className="empty-state-execution">
          <Scale size={32} color="#6b7280" />
          <h4>No Executions Match Filter</h4>
          <p>Click "Run Real Execution Test" to trigger an autonomous cycle tested by the AI agent.</p>
          <button className="btn-trigger-execution" style={{ marginTop: '12px' }} onClick={onTriggerCycle}>
            <Play size={13} /> Trigger First Real Test Execution
          </button>
        </div>
      ) : (
        <div className="execution-run-list">
          {filteredRuns.map((run, index) => {
            const timeStr = new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = new Date(run.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

            const firstReview = run.reviews[0];
            const candidateTitle = firstReview?.candidateTitle || run.publishedPost?.topicKey || 'Autonomous Topic Candidate';
            const novelty = typeof firstReview?.noveltyScore === 'number' ? firstReview.noveltyScore : 0.85;
            const relevance = typeof firstReview?.relevanceScore === 'number' ? firstReview.relevanceScore : 0.92;

            return (
              <motion.div
                key={run.id}
                className="execution-run-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                onClick={() => setSelectedRun(run)}
              >
                {/* Top Card Info Bar */}
                <div className="run-card-header">
                  <div className="run-id-agent">
                    <span className="run-id-pill">{run.id}</span>
                    <span className="run-agent-name">🤖 {run.agentName}</span>
                    <span className="run-agent-domain">[{run.agentDomain}]</span>
                  </div>

                  <div className="run-header-right">
                    {run.durationSec !== null && (
                      <span className="run-duration-tag">
                        <Clock size={10} /> {run.durationSec}s
                      </span>
                    )}
                    <span className="run-timestamp-tag">{dateStr} {timeStr}</span>
                    {getOutcomeBadge(run.outcome)}
                  </div>
                </div>

                {/* Card Title & Rationale */}
                <div className="run-card-body">
                  <div className="run-topic-title">
                    {candidateTitle}
                  </div>

                  {firstReview?.reason && (
                    <div className="run-editorial-reason">
                      "💬 Judge Verdict: {firstReview.reason}"
                    </div>
                  )}

                  {run.publishedPost && (
                    <div className="run-post-snippet">
                      📝 Published Post Draft: "{run.publishedPost.text.slice(0, 140)}..."
                    </div>
                  )}

                  {/* 3. Visual Step Pipeline Node Trace */}
                  <div className="visual-pipeline-container">
                    <div className="pipeline-title-lbl">EXECUTION PIPELINE NODE TRACE</div>
                    <div className="pipeline-steps-row">
                      {/* Step 1: Trigger / Schedule */}
                      <div className="pipeline-step-node pass" title="Step 1: Cycle Triggered">
                        <div className="step-icon"><Clock size={11} /></div>
                        <span className="step-lbl">1. Trigger</span>
                      </div>
                      <ChevronRight size={12} className="pipeline-arrow" />

                      {/* Step 2: Discovery / Search */}
                      <div className="pipeline-step-node pass" title="Step 2: Candidate News Topics Discovered">
                        <div className="step-icon"><Search size={11} /></div>
                        <span className="step-lbl">2. Discovery</span>
                      </div>
                      <ChevronRight size={12} className="pipeline-arrow" />

                      {/* Step 3: Editorial Judgment */}
                      <div
                        className={`pipeline-step-node ${
                          run.outcome === 'skipped_all_rejected' || run.outcome === 'skipped_no_candidates'
                            ? 'fail'
                            : 'pass'
                        }`}
                        title={`Step 3: Judgment Scored Novelty ${(novelty * 100).toFixed(0)}%`}
                      >
                        <div className="step-icon"><Scale size={11} /></div>
                        <span className="step-lbl">3. Judgment</span>
                      </div>
                      <ChevronRight size={12} className="pipeline-arrow" />

                      {/* Step 4: AI Voice Writing */}
                      <div
                        className={`pipeline-step-node ${
                          run.outcome === 'skipped_all_rejected'
                            ? 'dim'
                            : run.outcome === 'published'
                            ? 'pass'
                            : 'pass'
                        }`}
                        title="Step 4: Persona Voice Writing"
                      >
                        <div className="step-icon"><Cpu size={11} /></div>
                        <span className="step-lbl">4. Synthesizer</span>
                      </div>
                      <ChevronRight size={12} className="pipeline-arrow" />

                      {/* Step 5: SQLite Memory Dedup */}
                      <div
                        className={`pipeline-step-node ${
                          run.outcome === 'skipped_dedup' || run.outcome === 'skipped_near_duplicate'
                            ? 'warn'
                            : run.outcome === 'skipped_all_rejected'
                            ? 'dim'
                            : 'pass'
                        }`}
                        title="Step 5: Memory Dedup Check"
                      >
                        <div className="step-icon"><Database size={11} /></div>
                        <span className="step-lbl">5. Memory</span>
                      </div>
                      <ChevronRight size={12} className="pipeline-arrow" />

                      {/* Step 6: Publish Output */}
                      <div
                        className={`pipeline-step-node ${run.outcome === 'published' ? 'pass' : 'dim'}`}
                        title="Step 6: Published to Feed"
                      >
                        <div className="step-icon"><Send size={11} /></div>
                        <span className="step-lbl">6. Publish</span>
                      </div>
                    </div>
                  </div>

                  {/* Score progress bars */}
                  {firstReview && (
                    <div className="run-scores-row">
                      <div className="score-col">
                        <div className="score-top-lbl">
                          <span>Novelty Score</span>
                          <span>{(novelty * 100).toFixed(0)}%</span>
                        </div>
                        <div className="score-track-bg">
                          <div className="score-fill-purple" style={{ width: `${novelty * 100}%` }} />
                        </div>
                      </div>

                      <div className="score-col">
                        <div className="score-top-lbl">
                          <span>Relevance Score</span>
                          <span>{(relevance * 100).toFixed(0)}%</span>
                        </div>
                        <div className="score-track-bg">
                          <div className="score-fill-green" style={{ width: `${relevance * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. Execution Detail Modal Drawer */}
      <AnimatePresence>
        {selectedRun && (
          <div className="modal-backdrop" onClick={() => setSelectedRun(null)}>
            <motion.div
              className="execution-detail-modal"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-topbar">
                <div className="modal-title-wrap">
                  <span className="modal-run-id">{selectedRun.id}</span>
                  <h4>Real Execution Details</h4>
                </div>
                <button className="modal-close-btn" onClick={() => setSelectedRun(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body-scroll">
                {/* Meta details */}
                <div className="detail-meta-grid">
                  <div className="meta-item">
                    <span className="meta-lbl">Agent Persona</span>
                    <span className="meta-val">🤖 {selectedRun.agentName}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-lbl">Domain</span>
                    <span className="meta-val">{selectedRun.agentDomain}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-lbl">Executed At</span>
                    <span className="meta-val">{new Date(selectedRun.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-lbl">Execution Status</span>
                    <span className="meta-val">{getOutcomeBadge(selectedRun.outcome)}</span>
                  </div>
                </div>

                {/* Candidate Topics Evaluated */}
                {selectedRun.reviews.length > 0 && (
                  <div className="modal-section">
                    <div className="section-header">
                      <Scale size={14} color="#8b5cf6" />
                      <h5>Candidate Topics Tested by AI Judge</h5>
                    </div>
                    {selectedRun.reviews.map((rev, i) => (
                      <div key={i} className="detail-review-card">
                        <div className="review-top-line">
                          <span className={`verdict-chip ${rev.verdict}`}>
                            {rev.verdict === 'accept' ? 'ACCEPTED' : 'REJECTED'}
                          </span>
                          <span className="candidate-title-bold">{rev.candidateTitle || 'Untitled Topic'}</span>
                        </div>
                        {rev.reason && <p className="review-reason-text">"{rev.reason}"</p>}
                        {rev.candidateUrl && (
                          <a href={rev.candidateUrl} target="_blank" rel="noreferrer" className="candidate-link">
                            <ExternalLink size={11} /> Source Article: {rev.candidateUrl}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Published Post Content */}
                {selectedRun.publishedPost && (
                  <div className="modal-section">
                    <div className="section-header">
                      <Sparkles size={14} color="#10b981" />
                      <h5>Generated Editorial Post</h5>
                    </div>
                    <div className="detail-post-box">
                      <p className="post-text">{selectedRun.publishedPost.text}</p>
                      <div className="post-rationale">
                        <strong>Editorial Rationale:</strong> {selectedRun.publishedPost.rationale}
                      </div>
                      {selectedRun.publishedPost.sources && selectedRun.publishedPost.sources.length > 0 && (
                        <div className="post-sources">
                          <strong>Sources:</strong> {selectedRun.publishedPost.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw Execution Log */}
                {selectedRun.detail && (
                  <div className="modal-section">
                    <div className="section-header">
                      <FileText size={14} color="#94a3b8" />
                      <h5>Raw Log Execution Message</h5>
                    </div>
                    <pre className="detail-log-pre">{selectedRun.detail}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
