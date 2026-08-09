import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Mic, Target, Lightbulb, ClipboardCheck, Zap,
  CheckCircle2, XCircle, Newspaper, Clock, Activity, Play, Pause, ExternalLink
} from 'lucide-react';
import { Agent, Post, TopicReview, RunLog } from '../types';

interface PersonaTabProps {
  agents: Agent[];
  selectedAgentId: string;
  posts?: Post[];
  reviews?: TopicReview[];
  logs?: RunLog[];
  onTriggerCycle?: () => void;
  isTriggering?: boolean;
  onToggleStatus?: () => void;
  isActive?: boolean;
}

export const PersonaTab: React.FC<PersonaTabProps> = ({
  agents,
  selectedAgentId,
  posts = [],
  reviews = [],
  logs = [],
  onTriggerCycle,
  isTriggering,
  onToggleStatus,
  isActive = true,
}) => {
  const agent = selectedAgentId !== 'all'
    ? agents.find((a) => a.agentId === selectedAgentId)
    : agents[0];

  if (!agent) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Brain size={32} color="#71717a" />
        <p style={{ fontSize: '13px' }}>No agent selected. Create or select an agent to inspect their persona identity.</p>
      </div>
    );
  }

  const p = agent.persona;
  const agentPosts = posts.filter((post) => post.agentId === agent.agentId);
  const agentReviews = reviews.filter((r) => r.agentId === agent.agentId);

  const rejectedCount = agentReviews.filter((r) => r.verdict === 'reject').length;
  const avgNovelty = agentReviews.length > 0
    ? Math.round(agentReviews.reduce((acc, r) => acc + (r.noveltyScore || 0), 0) / agentReviews.length)
    : 85;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Agent Header Banner */}
        <div style={{
          background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: '#ffffff',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)', flexShrink: 0,
            }}>
              {p.name[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>{p.name}</div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                  background: agent.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: agent.status === 'active' ? '#22c55e' : '#ef4444',
                  border: `1px solid ${agent.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}>
                  {agent.status === 'active' ? '● ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#818cf8', background: 'rgba(99, 102, 241, 0.12)',
                padding: '2px 10px', borderRadius: '100px', display: 'inline-block', marginTop: '4px',
              }}>
                {p.domain}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onToggleStatus && (
              <button
                onClick={onToggleStatus}
                style={{
                  padding: '9px 16px', background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                  color: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {agent.status === 'active' ? <><Pause size={14} /> Pause Cycles</> : <><Play size={14} /> Activate Persona</>}
              </button>
            )}
            {onTriggerCycle && (
              <button
                onClick={onTriggerCycle}
                disabled={isTriggering}
                style={{
                  padding: '9px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)', opacity: isTriggering ? 0.7 : 1,
                }}
              >
                <Zap size={14} className={isTriggering ? 'spin' : ''} />
                {isTriggering ? 'Triggering...' : 'Run Cycle Now'}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{
          fontSize: '13.5px', color: '#f4f4f5', lineHeight: 1.7, background: 'rgba(16, 16, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px',
          backdropFilter: 'blur(16px)',
        }}>
          {p.bio}
        </div>

        {/* Performance Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Published Posts', val: agentPosts.length, icon: Newspaper, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
            { label: 'Topics Evaluated', val: agentReviews.length, icon: Activity, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.12)' },
            { label: 'Rejected Standards', val: rejectedCount, icon: XCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
            { label: 'Avg Novelty %', val: `${avgNovelty}%`, icon: CheckCircle2, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
          ].map((m, idx) => (
            <div key={idx} style={{
              background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(16px)',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: m.color, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <m.icon size={18} /> {m.val}
              </div>
            </div>
          ))}
        </div>

        {/* Persona Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{
            background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px', padding: '20px', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Mic size={14} color="#06b6d4" /> Voice & Perspective
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#9d9db8' }}>
              <div><span style={{ color: '#71717a' }}>Tone:</span> {p.voice.tone}</div>
              <div><span style={{ color: '#71717a' }}>Style:</span> {p.voice.sentenceStyle}</div>
              <div><span style={{ color: '#71717a' }}>POV:</span> {p.voice.personPOV} person</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px', padding: '20px', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Target size={14} color="#06b6d4" /> Interest Topics
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {p.interests.map((t, i) => (
                <span key={i} style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(20, 20, 32, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#9d9db8' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px', padding: '20px', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Lightbulb size={14} color="#06b6d4" /> Editorial Opinions
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#9d9db8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {p.opinions.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>

          <div style={{
            background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px', padding: '20px', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ClipboardCheck size={14} color="#06b6d4" /> Publishing Standards
            </h4>
            <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#9d9db8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {p.publishingStandards.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>

        {/* Executed Posts Task History */}
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={16} color="#06b6d4" /> Published Feed Posts ({agentPosts.length})
          </h4>
          {agentPosts.length === 0 ? (
            <div style={{ background: 'rgba(16, 16, 28, 0.5)', border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
              No tasks executed for this agent yet. Click "Run Cycle Now" above to trigger initial discovery!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {agentPosts.map((post) => (
                <div key={post.id} style={{ background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#71717a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {new Date(post.createdAt).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                      PUBLISHED
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffffff', lineHeight: 1.6 }}>{post.text}</div>
                  {post.rationale && (
                    <div style={{ fontSize: '11px', color: '#9d9db8', fontStyle: 'italic', background: 'rgba(99, 102, 241, 0.06)', padding: '8px 12px', borderRadius: '8px', borderLeft: '2px solid #6366f1' }}>
                      <strong>Why Published:</strong> {post.rationale}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
