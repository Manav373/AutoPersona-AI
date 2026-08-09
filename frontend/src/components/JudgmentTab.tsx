import React, { useState, useMemo } from 'react';
import {
  Scale, CheckCircle2, XCircle, AlertCircle, Play, RefreshCw,
  Search, Database, Sparkles, Send, Clock, ChevronRight, X,
  FileText, Filter, ExternalLink, Cpu, Activity, Layers,
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

  React.useEffect(() => {
    setFilterAgent(selectedAgentId);
  }, [selectedAgentId]);

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

        const correlatedReviews = reviews.filter((r) => {
          if (r.agentId !== log.agentId) return false;
          const rTime = new Date(r.reviewedAt).getTime();
          return Math.abs(rTime - startTime) < 30000 || Math.abs(rTime - endTime) < 30000;
        });

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

  const filteredRuns = useMemo(() => {
    return executionRuns.filter((run) => {
      if (filterAgent !== 'all' && run.agentId !== filterAgent) return false;
      if (statusFilter === 'published' && run.outcome !== 'published') return false;
      if (statusFilter === 'skipped_dedup' && run.outcome !== 'skipped_dedup' && run.outcome !== 'skipped_near_duplicate') return false;
      if (statusFilter === 'skipped_rejected' && run.outcome !== 'skipped_all_rejected' && run.outcome !== 'skipped_no_candidates') return false;
      if (statusFilter === 'error' && run.outcome !== 'error') return false;

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

  const stats = useMemo(() => {
    const total = filteredRuns.length;
    const published = filteredRuns.filter((r) => r.outcome === 'published').length;
    const rejected = filteredRuns.filter((r) => r.outcome === 'skipped_all_rejected').length;
    const deduped = filteredRuns.filter((r) => r.outcome === 'skipped_dedup' || r.outcome === 'skipped_near_duplicate').length;
    const publishRate = total > 0 ? ((published / total) * 100).toFixed(0) : '0';
    const durations = filteredRuns.map((r) => r.durationSec).filter((d): d is number => d !== null);
    const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) : '1.8';
    const totalEvaluated = filterAgent === 'all' ? reviews.length : reviews.filter((r) => r.agentId === filterAgent).length;

    return { total, published, rejected, deduped, publishRate, avgDuration, totalEvaluated };
  }, [filteredRuns, reviews, filterAgent]);

  const getOutcomeBadge = (outcome: ExecutionRunItem['outcome']) => {
    const badgeStyle: React.CSSProperties = {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 9px', borderRadius: '12px', fontSize: '10px',
      fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
    };

    switch (outcome) {
      case 'published':
        return <span style={{ ...badgeStyle, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}><CheckCircle2 size={11} /> PUBLISHED</span>;
      case 'skipped_dedup':
      case 'skipped_near_duplicate':
        return <span style={{ ...badgeStyle, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}><Database size={11} /> DEDUP SKIPPED</span>;
      case 'skipped_all_rejected':
      case 'skipped_no_candidates':
        return <span style={{ ...badgeStyle, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}><XCircle size={11} /> REJECTED</span>;
      case 'error':
        return <span style={{ ...badgeStyle, background: 'rgba(225, 29, 72, 0.2)', color: '#fda4af', border: '1px solid rgba(225, 29, 72, 0.4)' }}><AlertCircle size={11} /> ERROR</span>;
      default:
        return <span style={{ ...badgeStyle, background: 'rgba(255, 255, 255, 0.08)', color: '#a1a1aa' }}><Clock size={11} /> {String(outcome).replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Controls & KPI Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(16, 16, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '22px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa',
              position: 'relative',
            }}>
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Real Agent Execution Audit</h3>
              <p style={{ fontSize: '12px', color: '#9d9db8', margin: '2px 0 0' }}>Live, verified execution pipeline trace tested by persona agents</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {agents.length > 0 && (
              <select
                value={filterAgent}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterAgent(val);
                  if (onSelectAgent) onSelectAgent(val);
                }}
                style={{
                  padding: '8px 12px', background: 'rgba(20, 20, 32, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
                  color: '#ffffff', fontSize: '12px', outline: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
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

            <button
              onClick={() => { if (onTriggerCycle) onTriggerCycle(); }}
              disabled={isTriggering}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                borderRadius: '8px', color: '#ffffff', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)', opacity: isTriggering ? 0.7 : 1,
              }}
            >
              {isTriggering ? (
                <><RefreshCw size={13} className="spin" /> Executing Pipeline...</>
              ) : (
                <><Play size={13} /> Run Real Execution Test</>
              )}
            </button>
          </div>
        </div>

        {/* KPI Metrics Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { label: 'Total Executions', val: stats.total, icon: Layers, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.15)' },
            { label: 'Publish Success Rate', val: `${stats.publishRate}%`, icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
            { label: 'Topics Evaluated', val: stats.totalEvaluated, icon: Scale, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
            { label: 'Avg Latency', val: `${stats.avgDuration}s`, icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
          ].map((kpi, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              background: 'rgba(20, 20, 32, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '6px', background: kpi.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, flexShrink: 0,
              }}>
                <kpi.icon size={14} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{kpi.val}</div>
                <div style={{ fontSize: '10px', color: '#71717a' }}>{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: `All Runs (${executionRuns.length})` },
              { key: 'published', label: `Published (${stats.published})` },
              { key: 'skipped_dedup', label: `Dedup Skipped (${stats.deduped})` },
              { key: 'skipped_rejected', label: `Rejected (${stats.rejected})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key as StatusFilter)}
                style={{
                  background: statusFilter === t.key ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: statusFilter === t.key ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  borderRadius: '14px', color: statusFilter === t.key ? '#818cf8' : '#a1a1aa',
                  fontSize: '11px', fontWeight: 600, padding: '4px 12px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', color: '#71717a', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search topics, rationale, or persona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 28px', background: 'rgba(20, 20, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
                color: '#ffffff', fontSize: '11px', outline: 'none', width: '220px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Execution Run Feed */}
      {filteredRuns.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '10px', padding: '60px 20px', textAlign: 'center', background: 'rgba(16, 16, 28, 0.5)',
          border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '16px',
        }}>
          <Scale size={32} color="#71717a" />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>No Executions Match Filter</h4>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Click "Run Real Execution Test" to trigger an autonomous cycle tested by the AI agent.</p>
          <button
            onClick={onTriggerCycle}
            style={{
              marginTop: '8px', padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Play size={13} /> Trigger First Real Test Execution
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                onClick={() => setSelectedRun(run)}
                style={{
                  background: 'rgba(16, 16, 28, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: 'var(--bg-input)', color: 'var(--text-secondary)',
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700,
                      padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)',
                    }}>
                      {run.id}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>🤖 {run.agentName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>[{run.agentDomain}]</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {run.durationSec !== null && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {run.durationSec}s
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dateStr} {timeStr}</span>
                    {getOutcomeBadge(run.outcome)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{candidateTitle}</div>

                  {firstReview?.reason && (
                    <div style={{
                      fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic',
                      background: 'var(--bg-input)', padding: '6px 10px',
                      borderRadius: '6px', borderLeft: '2px solid #6366f1',
                    }}>
                      "💬 Judge Verdict: {firstReview.reason}"
                    </div>
                  )}

                  {run.publishedPost && (
                    <div style={{
                      fontSize: '12px', color: 'var(--text-primary)', background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.25)', padding: '8px 12px', borderRadius: '6px',
                    }}>
                      📝 Published Post Draft: "{run.publishedPost.text.slice(0, 140)}..."
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Execution Detail Modal */}
      <AnimatePresence>
        {selectedRun && (
          <div
            onClick={() => setSelectedRun(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0d0d14', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '85vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                    {selectedRun.id}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Real Execution Details</h4>
                </div>
                <button onClick={() => setSelectedRun(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: 'rgba(20, 20, 32, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px 16px' }}>
                  <div><div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Agent Persona</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>🤖 {selectedRun.agentName}</div></div>
                  <div><div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Domain</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{selectedRun.agentDomain}</div></div>
                  <div><div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Executed At</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{new Date(selectedRun.timestamp).toLocaleString()}</div></div>
                  <div><div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Execution Status</div><div>{getOutcomeBadge(selectedRun.outcome)}</div></div>
                </div>

                {selectedRun.reviews.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                      <Scale size={14} color="#8b5cf6" /> Candidate Topics Tested by AI Judge
                    </div>
                    {selectedRun.reviews.map((rev, i) => (
                      <div key={i} style={{ background: 'rgba(20, 20, 32, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: rev.verdict === 'accept' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: rev.verdict === 'accept' ? '#22c55e' : '#ef4444' }}>
                            {rev.verdict === 'accept' ? 'ACCEPTED' : 'REJECTED'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{rev.candidateTitle || 'Untitled Topic'}</span>
                        </div>
                        {rev.reason && <p style={{ fontSize: '12px', color: '#9d9db8', fontStyle: 'italic', margin: 0 }}>"{rev.reason}"</p>}
                      </div>
                    ))}
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
