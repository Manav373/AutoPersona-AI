import React, { useState } from 'react';
import { HelpCircle, Search, BookOpen, Cpu, Shield, Clock, FileText, Zap, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOC_TOPICS = [
  {
    category: 'Getting Started',
    title: 'Autonomous Discovery & Publishing Cycle',
    desc: 'How AutoPersona AI periodically monitors live search news, evaluates candidates with LLM judgment, and publishes synthesized posts.',
    content: 'Every 2 hours (or on demand via "Run Cycle Now"), active agents fetch live web topics via Tavily API. The LLM Editorial Judge scores candidates for novelty (% uniqueness) and relevance to persona domain. High-scoring topics are written in persona voice and posted directly to the feed.',
  },
  {
    category: 'Workflows',
    title: 'Workflow Canvas Node Palette & Cable Connections',
    desc: 'Guide to drag-and-drop nodes, editing triggers, connecting ports, and inspecting execution payloads.',
    content: 'Drag tools from the left palette (Schedule Trigger, Web Discoverer, AI Judge, Voice Synthesizer, Memory Vector Store) onto the canvas. Click any port dot to drag connection cables between nodes. Click any node to customize parameters in the Right Inspector Panel.',
  },
  {
    category: 'AI Judgment',
    title: 'Persona Standards & Novelty Scoring',
    desc: 'Configuring relevance thresholds, duplicate topic deduplication, and publishing standards.',
    content: 'Each persona defines specific interest domains, publishing standards, and opinion bias. The AI Editorial Judge checks candidate topics against previously published SQLite memory keys to prevent repeating past stories.',
  },
  {
    category: 'Settings',
    title: 'API Keys & System Variables',
    desc: 'Setting GROQ_API_KEY, TAVILY_API_KEY, MAX_DAILY_POSTS, and execution intervals.',
    content: 'Navigate to API Credentials to manage model provider keys. In System Variables, configure system parameters like MAX_DAILY_POSTS or MIN_NOVELTY_SCORE thresholds.',
  },
];

export const HelpDocModal: React.FC<HelpDocModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const filteredTopics = DOC_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = filteredTopics[selectedIdx] || filteredTopics[0] || DOC_TOPICS[0];

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
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
            background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
            borderRadius: '20px', width: '100%', maxWidth: '780px', height: '80vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header Bar */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Documentation & System Guide
              </h3>
            </div>

            {/* Search Input */}
            <div style={{ flex: 1, maxWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedIdx(0); }}
                style={{
                  width: '100%', padding: '6px 12px 6px 30px', background: 'var(--bg-input)',
                  border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)',
                  fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Modal Split View */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar Article List */}
            <div style={{ width: '280px', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-surface)' }}>
              {filteredTopics.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  style={{
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: selectedIdx === i ? 'var(--bg-input)' : 'transparent',
                    border: selectedIdx === i ? '1px solid var(--border)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {topic.category}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {topic.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Article Content Detail Pane */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeDoc && (
                <>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
                      {activeDoc.category}
                    </span>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '10px 0 6px' }}>
                      {activeDoc.title}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {activeDoc.desc}
                    </p>
                  </div>

                  <div style={{
                    padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6,
                  }}>
                    {activeDoc.content}
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-primary)' }}>
                    💡 <strong>Pro Tip:</strong> You can trigger a live test execution cycle at any time by clicking <strong>"Run Cycle Now"</strong> in the top header bar or Workflow canvas.
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
