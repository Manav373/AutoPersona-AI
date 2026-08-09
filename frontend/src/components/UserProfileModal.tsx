import React from 'react';
import { User, Shield, Zap, Key, Sparkles, X, CheckCircle2, Building, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, showToast }) => {
  if (!isOpen) return null;

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
            borderRadius: '20px', width: '100%', maxWidth: '560px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header Banner */}
          <div style={{
            padding: '20px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
            borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '18px', color: '#ffffff', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
              }}>
                A
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Aarav Mehta</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>aarav.mehta@autopersona.ai • Lead AI Architect</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Plan Tier & Workspace Info */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#6366f1" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Pro Plan Subscription</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  ✓ ACTIVE ($49/mo)
                </span>
              </div>

              {/* Usage Progress Indicators */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Autonomous Cycle Executions</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>1,420 / 5,000 (28%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '100px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                    <div style={{ width: '28%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '100px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Active Personas Deployed</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>6 / 20 Agents</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '100px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '100px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace & Security Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Active Workspace</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={13} color="#818cf8" /> Manav373/AutoPersona-AI
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Role Permissions</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={13} color="#22c55e" /> Workspace Admin (Full Access)
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => {
                  showToast('🚀 Upgraded workspace to Enterprise tier with unlimited execution quotas!');
                  onClose();
                }}
                style={{
                  flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Zap size={14} /> Upgrade Plan
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText('ap_live_983741920834');
                  showToast('🔑 New API Token generated and copied to clipboard: ap_live_983741920834');
                }}
                style={{
                  padding: '10px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Key size={14} /> Copy Token
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
