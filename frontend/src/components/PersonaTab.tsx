import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Mic, Target, Lightbulb, ClipboardCheck, Zap,
  CheckCircle2, XCircle, Newspaper, Clock, Activity, Play, Pause,
  Sparkles, Settings2, Sliders, ChevronRight, UserCheck, Shield
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
  onSelectAgent?: (id: string) => void;
}

export const PersonaTab: React.FC<PersonaTabProps> = ({
  agents = [],
  selectedAgentId,
  posts = [],
  reviews = [],
  logs = [],
  onTriggerCycle,
  isTriggering,
  onToggleStatus,
  isActive = true,
  onSelectAgent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tuning' | 'history'>('overview');

  const currentAgentId = selectedAgentId !== 'all' ? selectedAgentId : (agents[0]?.agentId || '');
  const agent = agents.find((a) => a.agentId === currentAgentId) || agents[0];

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
    : 88;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Agents Selection Switcher Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '4px',
        background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px', backdropFilter: 'blur(16px)', flexShrink: 0,
      }}>
        {agents.map((ag) => {
          const isSelected = ag.agentId === currentAgentId;
          return (
            <motion.button
              key={ag.agentId}
              onClick={() => {
                if (onSelectAgent) onSelectAgent(ag.agentId);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                borderRadius: '10px', fontSize: '12px', fontWeight: 700, border: 'none',
                background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: isSelected ? '#ffffff' : '#71717a', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', position: 'relative', flexShrink: 0,
                outline: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#ffffff', fontWeight: 800,
              }}>
                {ag.persona.name[0]}
              </div>
              <span>{ag.persona.name}</span>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: ag.status === 'active' ? '#22c55e' : '#71717a',
              }} />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={agent.agentId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Agent Header Hero Banner */}
          <div style={{
            background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', flexWrap: 'wrap', gap: '16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #38bdf8)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <motion.div
                animate={{ boxShadow: ['0 0 16px rgba(99, 102, 241, 0.3)', '0 0 28px rgba(99, 102, 241, 0.6)', '0 0 16px rgba(99, 102, 241, 0.3)'] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 800, color: '#ffffff', flexShrink: 0,
                }}
              >
                {p.name[0]}
              </motion.div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{p.name}</div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                    background: agent.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: agent.status === 'active' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${agent.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}>
                    {agent.status === 'active' ? '● ACTIVE ENGINE' : 'PAUSED'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, color: 'var(--primary-light)', background: 'rgba(99, 102, 241, 0.12)',
                    padding: '2px 10px', borderRadius: '100px', border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}>
                    {p.domain}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{agent.agentId}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {onToggleStatus && (
                <motion.button
                  onClick={onToggleStatus}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '8px 16px', background: 'var(--bg-input)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {agent.status === 'active' ? <><Pause size={14} /> Pause Cycles</> : <><Play size={14} /> Activate Agent</>}
                </motion.button>
              )}
              {onTriggerCycle && (
                <motion.button
                  onClick={onTriggerCycle}
                  disabled={isTriggering}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px',
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)', opacity: isTriggering ? 0.7 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Zap size={14} className={isTriggering ? 'spin' : ''} />
                  {isTriggering ? 'Running...' : 'Run Cycle Now'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Subtabs Bar */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveSubTab('overview')}
              style={{
                padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                color: activeSubTab === 'overview' ? '#6366f1' : 'var(--text-secondary)',
                background: activeSubTab === 'overview' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Identity & Voice
            </button>
            <button
              onClick={() => setActiveSubTab('tuning')}
              style={{
                padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                color: activeSubTab === 'tuning' ? '#6366f1' : 'var(--text-secondary)',
                background: activeSubTab === 'tuning' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Persona Tuning & Specs
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              style={{
                padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                color: activeSubTab === 'history' ? '#6366f1' : 'var(--text-secondary)',
                background: activeSubTab === 'history' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Executed Posts ({agentPosts.length})
            </button>
          </div>

          {/* Subtab Content */}
          {activeSubTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Bio */}
              <div style={{
                fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.7, background: 'rgba(16, 16, 28, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px',
                backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}>
                <strong style={{ color: 'var(--primary-light)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Persona Bio:</strong>
                {p.bio}
              </div>

              {/* Performance Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Published Posts', val: agentPosts.length, icon: Newspaper, color: '#22c55e' },
                  { label: 'Topics Evaluated', val: agentReviews.length, icon: Activity, color: '#a78bfa' },
                  { label: 'Rejected Standards', val: rejectedCount, icon: XCircle, color: '#f59e0b' },
                  { label: 'Avg Novelty %', val: `${avgNovelty}%`, icon: CheckCircle2, color: '#38bdf8' },
                ].map((m, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    style={{
                      background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(16px)',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: m.color, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <m.icon size={18} /> {m.val}
                    </div>
                  </motion.div>
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
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Target size={14} color="#06b6d4" /> Interest Topics
                  </h4>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {p.interests.map((t, i) => (
                      <span key={i} style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
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
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Lightbulb size={14} color="#06b6d4" /> Editorial Opinions
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {p.opinions.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>

                <div style={{
                  background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px', padding: '20px', backdropFilter: 'blur(16px)',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <ClipboardCheck size={14} color="#06b6d4" /> Publishing Standards
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {p.publishingStandards.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'tuning' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px', padding: '24px', backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}
            >
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--primary-light)" /> Persona Voice Tuning & Parameters
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Adjust LLM generation parameters for {p.name}. Changes apply dynamically to future workflow runs.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Voice Tone</label>
                  <input
                    type="text"
                    defaultValue={p.voice.tone}
                    style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sentence Style</label>
                  <input
                    type="text"
                    defaultValue={p.voice.sentenceStyle}
                    style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Perspective POV</label>
                  <select
                    defaultValue={p.voice.personPOV}
                    style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="first">First Person (I, my, our)</option>
                    <option value="third">Third Person (It, the system, engineers)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Execution Cadence</label>
                  <select
                    defaultValue="2h"
                    style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="1h">Every 1 Hour</option>
                    <option value="2h">Every 2 Hours</option>
                    <option value="6h">Every 6 Hours</option>
                    <option value="24h">Daily (24 Hours)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Newspaper size={16} color="#06b6d4" /> Published Posts for {p.name} ({agentPosts.length})
              </h4>
              {agentPosts.length === 0 ? (
                <div style={{ background: 'rgba(16, 16, 28, 0.5)', border: '1px dashed var(--border)', borderRadius: '14px', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No published posts recorded for {p.name} yet. Trigger a cycle above to run discovery!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {agentPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {new Date(post.createdAt).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                          PUBLISHED
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{post.text}</div>
                      {post.rationale && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(99, 102, 241, 0.06)', padding: '8px 12px', borderRadius: '8px', borderLeft: '2px solid #6366f1' }}>
                          <strong>Why Selected:</strong> {post.rationale}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
