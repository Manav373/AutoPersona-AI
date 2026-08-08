import React, { useState } from 'react';
import { X, Sparkles, Bot, Shield, Cpu, Code, Scale, Terminal, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, domain: string) => void;
  isSubmitting: boolean;
}

const POPULAR_DOMAINS = [
  { label: 'AI Security Researcher', name: 'Ada', domain: 'AI Security & Vulnerabilities', icon: Shield },
  { label: 'Machine Learning Engineer', name: 'Marcus', domain: 'Machine Learning Infrastructure', icon: Cpu },
  { label: 'AI Product Analyst', name: 'Elena', domain: 'AI Product Strategy & ROI', icon: Layers },
  { label: 'Open Source Contributor', name: 'Linus', domain: 'Open Source LLM Tooling', icon: Code },
  { label: 'Robotics Engineer', name: 'Kai', domain: 'Robotics & Embodied AI', icon: Bot },
  { label: 'Developer Advocate', name: 'Sarah', domain: 'Developer Experience & APIs', icon: Terminal },
  { label: 'AI Ethics Researcher', name: 'Maya', domain: 'AI Governance & Safety Ethics', icon: Scale },
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen, onClose, onSubmit, isSubmitting,
}) => {
  const [name, setName] = useState('Ada');
  const [domain, setDomain] = useState('AI Security & Vulnerabilities');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;
    onSubmit(name.trim(), domain.trim());
  };

  const handleSelectPreset = (presetName: string, presetDomain: string) => {
    setName(presetName);
    setDomain(presetDomain);
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          className="modal-box"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          style={{ maxWidth: '540px' }}
        >
          <div className="modal-head">
            <div className="modal-head-left">
              <div className="modal-icon">
                <Bot size={16} color="var(--accent)" />
              </div>
              <div>
                <div className="modal-title">Initialize Autonomous AI Creator</div>
                <div className="modal-subtitle">Configure persona identity for autonomous operation across any tech field</div>
              </div>
            </div>
            <button onClick={onClose} className="modal-close"><X size={16} /></button>
          </div>

          {/* Pipeline preview */}
          <div className="pipeline-preview">
            <div className="pp-node">
              <span className="pp-icon">🎯</span>
              <span className="pp-label">Field / Domain</span>
              <span className="pp-value">{domain || '…'}</span>
            </div>
            <div className="pp-cable" />
            <div className="pp-node">
              <span className="pp-icon">🧠</span>
              <span className="pp-label">Execution</span>
              <span className="pp-value">Autonomous</span>
            </div>
            <div className="pp-cable" />
            <div className="pp-node">
              <span className="pp-icon">✨</span>
              <span className="pp-label">Creator</span>
              <span className="pp-value">{name || '…'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Quick Inspiration Chips */}
            <div style={{ margin: '14px 0 10px 0' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Quick Field Inspiration (Click to Auto-fill):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_DOMAINS.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = domain === item.domain;
                  const chipBtnStyle: React.CSSProperties = {
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: isSelected ? '1px solid var(--purple)' : '1px solid var(--border)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  };
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(item.name, item.domain)}
                      style={chipBtnStyle}
                    >
                      <Icon size={12} color={isSelected ? 'var(--purple-light)' : 'var(--text-muted)'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '12px' }}>
              <div className="field-group">
                <label>Creator Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada, Marcus, Linus" required />
              </div>
              <div className="field-group">
                <label>Technology Field / Domain Focus</label>
                <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Quantum Computing, AI Security" required />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-accent">
                {isSubmitting ? <><Sparkles size={12} className="spin" /> Initializing Autonomous Creator…</> : <><Sparkles size={12} /> Initialize Agent</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
