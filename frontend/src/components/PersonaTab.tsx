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
      <div className="view-container">
        <div className="empty-state">
          <Brain size={28} color="#5c5c7a" />
          <p>No agent selected. Create or select an agent to inspect their persona and task execution details.</p>
        </div>
      </div>
    );
  }

  const p = agent.persona;
  const agentPosts = posts.filter((post) => post.agentId === agent.agentId);
  const agentReviews = reviews.filter((r) => r.agentId === agent.agentId);
  const agentLogs = logs.filter((l) => l.agentId === agent.agentId);

  const acceptedCount = agentReviews.filter((r) => r.verdict === 'accept').length;
  const rejectedCount = agentReviews.filter((r) => r.verdict === 'reject').length;
  const avgNovelty = agentReviews.length > 0
    ? Math.round(agentReviews.reduce((acc, r) => acc + (r.noveltyScore || 0), 0) / agentReviews.length)
    : 85;

  return (
    <div className="view-container" style={{ paddingBottom: '40px' }}>
      <motion.div
        className="persona-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Agent Header Banner */}
        <div className="persona-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="persona-avatar-lg">{p.name[0]}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="persona-hero-name">{p.name}</div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: agent.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: agent.status === 'active' ? 'var(--green)' : '#f87171',
                    border: `1px solid ${agent.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {agent.status === 'active' ? '● ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <span className="persona-domain-chip" style={{ marginTop: '4px', display: 'inline-block' }}>{p.domain}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {onToggleStatus && (
              <button
                className={`btn ${agent.status === 'active' ? 'btn-ghost' : 'btn-accent'}`}
                onClick={onToggleStatus}
                style={{ fontSize: '12px' }}
              >
                {agent.status === 'active' ? <><Pause size={13} /> Pause Cycles</> : <><Play size={13} /> Activate Persona</>}
              </button>
            )}
            {onTriggerCycle && (
              <button
                className="btn btn-accent"
                onClick={onTriggerCycle}
                disabled={isTriggering}
                style={{ fontSize: '12px' }}
              >
                <Zap size={13} className={isTriggering ? 'spin' : ''} />
                {isTriggering ? 'Triggering...' : 'Run Cycle Now'}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="persona-bio-text">{p.bio}</div>

        {/* Task & Performance Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '16px 0' }}>
          <div className="inspector-info-card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Published Posts
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Newspaper size={18} /> {agentPosts.length}
            </div>
          </div>

          <div className="inspector-info-card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Topics Evaluated
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={18} color="var(--purple-light)" /> {agentReviews.length}
            </div>
          </div>

          <div className="inspector-info-card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Rejected Standards
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={18} /> {rejectedCount}
            </div>
          </div>

          <div className="inspector-info-card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Avg Novelty %
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#60a5fa', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} /> {avgNovelty}%
            </div>
          </div>
        </div>

        {/* Persona Details Grid */}
        <div className="persona-sections">
          <motion.div className="persona-box" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h4><Mic size={12} color="var(--accent)" /> Voice & Perspective</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Tone:</span> {p.voice.tone}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Style:</span> {p.voice.sentenceStyle}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>POV:</span> {p.voice.personPOV} person</div>
            </div>
          </motion.div>

          <motion.div className="persona-box" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h4><Target size={12} color="var(--accent)" /> Interest Topics</h4>
            <div className="persona-tags">
              {p.interests.map((t, i) => (
                <span key={i} className="persona-tag">{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div className="persona-box" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h4><Lightbulb size={12} color="var(--accent)" /> Editorial Opinions</h4>
            <ul className="persona-items">
              {p.opinions.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </motion.div>

          <motion.div className="persona-box" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h4><ClipboardCheck size={12} color="var(--accent)" /> Publishing Standards</h4>
            <ul className="persona-items">
              {p.publishingStandards.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </motion.div>
        </div>

        {/* Executed Posts Task History */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={15} color="var(--accent)" /> Recent Autonomous Tasks & Published Output ({agentPosts.length})
          </h4>
          {agentPosts.length === 0 ? (
            <div className="inspector-info-card" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
              No tasks executed for this agent yet. Click "Run Cycle Now" above to trigger initial discovery!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {agentPosts.map((post) => (
                <div key={post.id} className="inspector-info-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                      PUBLISHED
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#fff', lineHeight: '1.5' }}>{post.text}</div>
                  {post.rationale && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px', borderLeft: '2px solid var(--purple)' }}>
                      <strong>Why Published:</strong> {post.rationale}
                    </div>
                  )}
                  {post.sources && post.sources.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {post.sources.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: 'var(--purple-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ExternalLink size={10} /> Source #{i + 1}
                        </a>
                      ))}
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

