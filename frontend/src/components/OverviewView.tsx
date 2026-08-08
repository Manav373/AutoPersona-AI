import React from 'react';
import { Bot, Newspaper, Scale, TrendingUp, Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Agent, Post, TopicReview, SystemStats } from '../types';

interface OverviewViewProps {
  stats: SystemStats | null;
  agents: Agent[];
  posts: Post[];
  reviews: TopicReview[];
  onTriggerCycle: () => void;
  onOpenCreateModal: () => void;
  onSelectAgent: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  agents,
  posts,
  reviews,
  onTriggerCycle,
  onOpenCreateModal,
  onSelectAgent,
}) => {
  const activeCount = stats ? stats.activeAgentsCount : agents.length;
  const postsCount = stats ? stats.postsCount : posts.length;
  const reviewsCount = stats ? stats.totalReviews : reviews.length;
  const acceptRate = stats ? stats.acceptanceRate : '85%';

  const topBannerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.05))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  };

  return (
    <div className="view-viewport-container" style={{ maxWidth: '1000px', margin: '0 auto', gap: '20px', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={topBannerStyle}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            ⚡ Autonomous Agent Command Center
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Your persona agents discover news, evaluate relevance, and publish feed posts autonomously.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button className="btn btn-topbar-purple" onClick={onOpenCreateModal}>
            <Sparkles size={14} /> New Agent
          </button>
          <button className="btn btn-topbar-outline" onClick={onTriggerCycle} disabled={agents.length === 0}>
            <Play size={14} /> Run Cycle
          </button>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="inspector-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="node-icon discover">
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Agents</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{activeCount}</div>
          </div>
        </div>

        <div className="inspector-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="node-icon generate">
            <Newspaper size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Published Posts</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{postsCount}</div>
          </div>
        </div>

        <div className="inspector-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="node-icon judge">
            <Scale size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reviewed Topics</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{reviewsCount}</div>
          </div>
        </div>

        <div className="inspector-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="node-icon output">
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acceptance Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{acceptRate}</div>
          </div>
        </div>
      </div>

      {/* Agents & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Active Personas */}
        <div className="inspector-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span>🤖 Active Personas</span>
            <span style={{ fontSize: '11px', color: 'var(--purple)', cursor: 'pointer' }} onClick={onOpenCreateModal}>+ Add</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No agents deployed yet. Create one to begin.</div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.agentId}
                  className="palette-item-card"
                  onClick={() => onSelectAgent(agent.agentId)}
                  style={{ justifyContent: 'space-between', padding: '8px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="agent-avatar-img">{agent.persona.name[0]}</div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{agent.persona.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{agent.persona.domain}</div>
                    </div>
                  </div>
                  <span className="status-dot-indicator" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Post Feed Preview */}
        <div className="inspector-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>📰 Recent Autonomous Post</div>

          {posts.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              No published posts yet. Trigger a workflow execution to run topic discovery and publishing.
            </div>
          ) : (
            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 600, marginBottom: '6px' }}>
                {posts[0].agentId ? agents.find((a) => a.agentId === posts[0].agentId)?.persona.name : 'Autonomous Agent'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '8px' }}>
                {posts[0].text.slice(0, 140)}...
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {new Date(posts[0].createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
