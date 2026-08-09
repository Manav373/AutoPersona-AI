import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirmLogout }) => {
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
            borderRadius: '20px', width: '100%', maxWidth: '420px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)', padding: '24px',
            gap: '16px', textAlign: 'center',
          }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
            margin: '0 auto',
          }}>
            <LogOut size={22} />
          </div>

          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Log Out of CogniPulse AI?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.5 }}>
              You are currently logged in as <strong>Aarav Mehta</strong> (aarav.mehta@autopersona.ai). Logging out will reset your active session.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirmLogout}
              style={{
                flex: 1, padding: '10px', background: '#ef4444', border: 'none',
                borderRadius: '8px', color: '#ffffff', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
              }}
            >
              Confirm Log Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
