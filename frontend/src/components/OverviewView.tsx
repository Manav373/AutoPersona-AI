import React from 'react';
import { Bot, Newspaper, Scale, TrendingUp, Sparkles, Play, ArrowUpRight, Activity } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
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

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Banner */}
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div
          variants={fadeUp}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '32px',
            alignItems: 'center',
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.06))',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '8px' }}>
              Command Center
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
              Autonomous Agent<br />Operations Hub
            </h2>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '8px', lineHeight: 1.6, maxWidth: '420px' }}>
              Persona agents discover, evaluate, and publish content autonomously. Monitor everything from here.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <motion.button
              onClick={onOpenCreateModal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 20px', fontSize: '12px', fontWeight: 700, color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '8px', boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Sparkles size={14} /> New Agent
            </motion.button>
            <motion.button
              onClick={onTriggerCycle}
              disabled={agents.length === 0}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 20px', fontSize: '12px', fontWeight: 600, color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '8px', fontFamily: 'Inter, sans-serif', opacity: agents.length === 0 ? 0.5 : 1,
              }}
            >
              <Play size={14} /> Run Cycle
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Bento Metrics */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '12px' }}
      >
        {/* Large hero card */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, borderColor: 'rgba(99, 102, 241, 0.3)' }}
          style={{
            background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', minHeight: '120px', backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#71717a' }}>Active Agents</span>
            <Bot size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={11} /> All systems operational
          </div>
        </motion.div>

        {[
          { label: 'Published', value: postsCount, icon: Newspaper, color: '#ffffff' },
          { label: 'Reviewed', value: reviewsCount, icon: Scale, color: '#ffffff' },
          { label: 'Accept Rate', value: acceptRate, icon: TrendingUp, color: '#22c55e' },
        ].map((m, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -2, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            style={{
              background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '120px', backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#71717a' }}>{m.label}</span>
              <m.icon size={14} color="#71717a" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: m.color, letterSpacing: '-0.02em' }}>{m.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Two-Column */}
      <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Active Personas */}
        <motion.div variants={fadeUp} style={{ background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Active Personas</span>
            <button
              onClick={onOpenCreateModal}
              style={{
                background: 'none', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '6px',
                color: '#818cf8', fontSize: '11px', padding: '3px 10px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              }}
            >
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#71717a', padding: '16px 0', textAlign: 'center' }}>
                No agents deployed yet.
              </div>
            ) : (
              agents.map((agent) => (
                <motion.div
                  key={agent.agentId}
                  onClick={() => onSelectAgent(agent.agentId)}
                  whileHover={{ borderColor: 'rgba(99, 102, 241, 0.3)', x: 2 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', background: 'rgba(20, 20, 32, 0.8)', border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px', cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#ffffff',
                    }}>
                      {agent.persona.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{agent.persona.name}</div>
                      <div style={{ fontSize: '10px', color: '#71717a' }}>{agent.persona.domain}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: agent.status === 'active' ? '#22c55e' : '#71717a' }} />
                    <ArrowUpRight size={12} color="#71717a" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Latest Post Feed Preview */}
        <motion.div variants={fadeUp} style={{ background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Latest Published Post</span>

          {posts.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#71717a', lineHeight: 1.6, padding: '16px 0', textAlign: 'center' }}>
              No published posts yet. Trigger a cycle to generate the first post.
            </div>
          ) : (
            <div style={{
              background: 'rgba(20, 20, 32, 0.8)', padding: '16px', borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  {posts[0].agentId ? agents.find((a) => a.agentId === posts[0].agentId)?.persona.name : 'Agent'}
                </span>
                <span style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: '4px',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                }}>
                  Published
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.6 }}>
                {posts[0].text.slice(0, 180)}…
              </div>
              <div style={{ fontSize: '10px', color: '#71717a', fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date(posts[0].createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
