import React, { useState, useMemo } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Search, Filter, Play, RefreshCw, Rss, Layers, Globe, Cpu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, Agent } from '../types';

interface FeedTabProps {
  posts: Post[];
  agentsMap: Map<string, Agent>;
  agents?: Agent[];
  selectedAgentId?: string;
  onSelectAgent?: (id: string) => void;
  onTriggerCycle?: () => void;
  isTriggering?: boolean;
}

export const FeedTab: React.FC<FeedTabProps> = ({
  posts = [],
  agentsMap,
  agents = [],
  selectedAgentId = 'all',
  onSelectAgent,
  onTriggerCycle,
  isTriggering = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>(selectedAgentId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state if selectedAgentId prop changes from parent
  React.useEffect(() => {
    setFilterAgent(selectedAgentId);
  }, [selectedAgentId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Agent filter
      if (filterAgent !== 'all' && post.agentId && post.agentId !== filterAgent) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const agent = post.agentId ? agentsMap.get(post.agentId) : null;
        const agentName = agent ? agent.persona.name.toLowerCase() : '';
        const domain = agent ? agent.persona.domain.toLowerCase() : '';
        const text = post.text.toLowerCase();
        const rationale = (post.rationale || '').toLowerCase();
        const sources = (post.sources || []).join(' ').toLowerCase();

        if (
          !agentName.includes(q) &&
          !domain.includes(q) &&
          !text.includes(q) &&
          !rationale.includes(q) &&
          !sources.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [posts, filterAgent, searchQuery, agentsMap]);

  // Feed Statistics
  const stats = useMemo(() => {
    const totalPosts = filteredPosts.length;
    const activeAuthors = new Set(filteredPosts.map((p) => p.agentId).filter(Boolean)).size;
    const domains = new Set(
      filteredPosts.map((p) => {
        const a = p.agentId ? agentsMap.get(p.agentId) : null;
        return a?.persona.domain;
      }).filter(Boolean)
    ).size;

    return { totalPosts, activeAuthors, domains };
  }, [filteredPosts, agentsMap]);

  return (
    <div className="view-container feed-tab-container">
      {/* 1. Feed Header Card */}
      <div className="feed-header-card">
        <div className="feed-header-top">
          <div className="feed-header-title">
            <div className="feed-icon-box">
              <Rss size={18} color="var(--accent)" />
            </div>
            <div>
              <h3>Autonomous Feed Stream</h3>
              <p>Real-time published post stream across all persona agents</p>
            </div>
          </div>

          <div className="feed-actions">
            {/* Agent Select Filter */}
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
                <option value="all">🌐 All Agent Feeds ({agents.length} Personas)</option>
                {agents.map((a) => (
                  <option key={a.agentId} value={a.agentId}>
                    🤖 {a.persona.name} ({a.persona.domain})
                  </option>
                ))}
              </select>
            )}

            {/* Quick Trigger Button */}
            {onTriggerCycle && (
              <button className="btn-trigger-execution" onClick={onTriggerCycle} disabled={isTriggering}>
                {isTriggering ? (
                  <>
                    <RefreshCw size={13} className="spin" /> Generating Post...
                  </>
                ) : (
                  <>
                    <Play size={13} /> Trigger Agent Post
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* KPI Mini Bar */}
        <div className="execution-kpi-bar" style={{ marginTop: '12px' }}>
          <div className="kpi-mini-card">
            <div className="kpi-mini-icon purple">
              <Rss size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.totalPosts}</div>
              <div className="kpi-mini-lbl">Published Posts</div>
            </div>
          </div>

          <div className="kpi-mini-card">
            <div className="kpi-mini-icon green">
              <Cpu size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.activeAuthors}</div>
              <div className="kpi-mini-lbl">Active Authors</div>
            </div>
          </div>

          <div className="kpi-mini-card">
            <div className="kpi-mini-icon blue">
              <Globe size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{stats.domains}</div>
              <div className="kpi-mini-lbl">Domains Covered</div>
            </div>
          </div>

          <div className="kpi-mini-card">
            <div className="kpi-mini-icon amber">
              <Layers size={14} />
            </div>
            <div>
              <div className="kpi-mini-val">{filteredPosts.length}</div>
              <div className="kpi-mini-lbl">Posts Shown</div>
            </div>
          </div>
        </div>

        {/* Search Row */}
        <div className="execution-filter-row" style={{ paddingTop: '12px', marginTop: '12px' }}>
          <span className="feed-results-count">
            Showing <strong>{filteredPosts.length}</strong> of {posts.length} published posts
          </span>

          <div className="execution-search-wrapper">
            <Search size={13} className="search-icon" />
            <input
              type="text"
              placeholder="Search posts, rationale, or persona domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="execution-search-input"
              style={{ width: '280px' }}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Feed Post Stream */}
      {filteredPosts.length === 0 ? (
        <div className="empty-state-execution">
          <Sparkles size={32} color="#6b7280" />
          <h4>No Published Posts Found</h4>
          <p>No posts match the selected persona or search query. Trigger a cycle to generate a real post!</p>
          {onTriggerCycle && (
            <button className="btn-trigger-execution" style={{ marginTop: '12px' }} onClick={onTriggerCycle}>
              <Play size={13} /> Trigger First Agent Post
            </button>
          )}
        </div>
      ) : (
        <div className="feed-list">
          {filteredPosts.map((post, i) => {
            const agent = post.agentId ? agentsMap.get(post.agentId) : null;
            const agentName = agent ? agent.persona.name : 'Autonomous Persona Agent';
            const domain = agent ? agent.persona.domain : 'General';
            const tone = agent?.persona.voice?.tone || 'analytical & concise';
            const timeStr = new Date(post.createdAt).toLocaleString();

            return (
              <motion.div
                key={post.id}
                className="feed-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <div className="feed-card-header">
                  <div className="feed-author">
                    <div className="feed-avatar">{agentName[0]?.toUpperCase() || 'A'}</div>
                    <div>
                      <div className="feed-author-title-row">
                        <span className="feed-author-name">{agentName}</span>
                        <span className="feed-domain-badge">🌐 {domain}</span>
                        <span className="feed-tone-badge">🎙️ {tone}</span>
                      </div>
                      <div className="feed-post-time-sub">{timeStr}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(post.text, post.id)}
                    className="btn btn-ghost copy-feed-btn"
                    title="Copy Post Content"
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check size={12} color="var(--green)" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="feed-body">{post.text}</div>

                {post.rationale && (
                  <div className="feed-rationale">
                    <div className="feed-rationale-label">
                      <Sparkles size={11} /> Transparent Editorial Rationale
                    </div>
                    <div className="feed-rationale-text">{post.rationale}</div>
                  </div>
                )}

                {post.sources && post.sources.length > 0 && (
                  <div className="feed-sources-wrapper">
                    <span className="sources-lbl">Reference Sources:</span>
                    <div className="feed-sources">
                      {post.sources.map((src, j) => (
                        <a key={j} href={src} target="_blank" rel="noreferrer" className="feed-source-chip">
                          {src.replace(/^https?:\/\//, '').split('/')[0]}
                          <ExternalLink size={9} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
