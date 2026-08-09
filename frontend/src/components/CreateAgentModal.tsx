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
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: '20px',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            width: '540px', maxWidth: '90vw', background: '#0d0d14',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px',
            padding: '28px', boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
            display: 'flex', flexDirection: 'column', gap: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>Initialize Autonomous AI Creator</div>
                <div style={{ fontSize: '11px', color: '#9d9db8' }}>Configure persona identity for autonomous operation across any tech field</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
          </div>

          {/* Pipeline preview */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(20, 20, 32, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '14px' }}>🎯</span>
              <span style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Field / Domain</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain || '…'}</span>
            </div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #6366f1, #10b981)', margin: '0 12px', opacity: 0.4 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '14px' }}>🧠</span>
              <span style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Execution</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>Autonomous</span>
            </div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #6366f1, #10b981)', margin: '0 12px', opacity: 0.4 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '14px' }}>✨</span>
              <span style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Creator</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>{name || '…'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Inspiration Chips */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Quick Field Inspiration (Click to Auto-fill):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_DOMAINS.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = domain === item.domain;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(item.name, item.domain)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '5px 12px', borderRadius: '100px', fontSize: '11px',
                        fontWeight: 600, border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: isSelected ? '#ffffff' : '#a1a1aa', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={12} color={isSelected ? '#818cf8' : '#71717a'} />
                      {item.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>Creator Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ada, Marcus, Linus"
                  required
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>Technology Field Focus</label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. Quantum Computing"
                  required
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#a1a1aa', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '9px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '6px', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
                }}
              >
                {isSubmitting ? <><Sparkles size={13} className="spin" /> Initializing…</> : <><Sparkles size={13} /> Initialize Agent</>}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
