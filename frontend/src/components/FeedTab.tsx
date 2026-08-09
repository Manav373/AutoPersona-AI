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

  React.useEffect(() => {
    setFilterAgent(selectedAgentId);
  }, [selectedAgentId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filterAgent !== 'all' && post.agentId && post.agentId !== filterAgent) {
        return false;
      }
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
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Feed Header Card */}
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
              background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
            }}>
              <Rss size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Autonomous Feed Stream</h3>
              <p style={{ fontSize: '12px', color: '#9d9db8', margin: '2px 0 0' }}>Real-time published post stream across all persona agents</p>
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
                <option value="all">🌐 All Agent Feeds ({agents.length} Personas)</option>
                {agents.map((a) => (
                  <option key={a.agentId} value={a.agentId}>
                    🤖 {a.persona.name} ({a.persona.domain})
                  </option>
                ))}
              </select>
            )}

            {onTriggerCycle && (
              <button
                onClick={onTriggerCycle}
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
                  <><RefreshCw size={13} className="spin" /> Generating Post...</>
                ) : (
                  <><Play size={13} /> Trigger Agent Post</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* KPI Mini Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { label: 'Published Posts', val: stats.totalPosts, icon: Rss, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.12)' },
            { label: 'Active Authors', val: stats.activeAuthors, icon: Cpu, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
            { label: 'Domains Covered', val: stats.domains, icon: Globe, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
            { label: 'Posts Shown', val: filteredPosts.length, icon: Layers, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
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
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{kpi.val}</div>
                <div style={{ fontSize: '10px', color: '#71717a' }}>{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px' }}>
          <span style={{ fontSize: '12px', color: '#71717a' }}>
            Showing <strong style={{ color: '#ffffff' }}>{filteredPosts.length}</strong> of {posts.length} published posts
          </span>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#71717a', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search posts, rationale, or persona domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 10px 7px 32px', background: 'rgba(20, 20, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
                color: '#ffffff', fontSize: '12px', outline: 'none', width: '280px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '2px' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Feed Post Stream */}
      {filteredPosts.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '12px', padding: '60px 20px', textAlign: 'center', background: 'rgba(16, 16, 28, 0.5)',
          border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '16px',
        }}>
          <Sparkles size={32} color="#71717a" />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>No Published Posts Found</h4>
          <p style={{ fontSize: '12px', color: '#71717a', maxWidth: '400px', margin: 0 }}>
            No posts match the selected persona or search query. Trigger a cycle to generate a real post!
          </p>
          {onTriggerCycle && (
            <button
              onClick={onTriggerCycle}
              style={{
                marginTop: '8px', padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Play size={13} /> Trigger First Agent Post
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredPosts.map((post, i) => {
            const agent = post.agentId ? agentsMap.get(post.agentId) : null;
            const agentName = agent ? agent.persona.name : 'Autonomous Persona Agent';
            const domain = agent ? agent.persona.domain : 'General';
            const tone = agent?.persona.voice?.tone || 'analytical & concise';
            const timeStr = new Date(post.createdAt).toLocaleString();

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                style={{
                  background: 'rgba(16, 16, 28, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 800, color: '#ffffff', flexShrink: 0,
                      boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
                    }}>
                      {agentName[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{agentName}</span>
                        <span style={{ fontSize: '10px', color: '#9d9db8', padding: '2px 8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>🌐 {domain}</span>
                        <span style={{ fontSize: '10px', color: '#9d9db8', padding: '2px 8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>🎙️ {tone}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>{timeStr}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(post.text, post.id)}
                    style={{
                      background: 'none', border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#9d9db8', padding: '5px 12px', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    {copiedId === post.id ? (
                      <><Check size={12} color="#10b981" /> Copied</>
                    ) : (
                      <><Copy size={12} /> Copy</>
                    )}
                  </button>
                </div>

                <div style={{ fontSize: '13.5px', color: '#f4f4f5', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {post.text}
                </div>

                {post.rationale && (
                  <div style={{
                    padding: '12px 14px', background: 'rgba(99, 102, 241, 0.06)',
                    border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={12} /> Transparent Editorial Rationale
                    </div>
                    <div style={{ fontSize: '12px', color: '#9d9db8', lineHeight: 1.5 }}>
                      {post.rationale}
                    </div>
                  </div>
                )}

                {post.sources && post.sources.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Reference Sources:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {post.sources.map((src, j) => (
                        <a
                          key={j}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', background: 'rgba(6, 182, 212, 0.08)',
                            border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '100px',
                            fontSize: '11px', color: '#22d3ee', textDecoration: 'none',
                          }}
                        >
                          {src.replace(/^https?:\/\//, '').split('/')[0]}
                          <ExternalLink size={10} />
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
