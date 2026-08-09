import React from 'react';
import { Terminal, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { RunLog, Agent } from '../types';

interface LogsTabProps {
  logs: RunLog[];
  agentsMap: Map<string, Agent>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, agentsMap }) => {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Terminal size={32} color="#71717a" />
        <p style={{ fontSize: '13px' }}>No autonomous execution logs recorded yet. Trigger a cycle to see real-time logs!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>Live System Execution Logs</h3>
          <p style={{ fontSize: '13px', color: '#9d9db8' }}>Audit trail of topic discovery, scoring verdicts, and publishing cycles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <Activity size={12} /> Real-Time Feed
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(12, 12, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {logs.map((log, i) => {
          const agent = agentsMap.get(log.agentId);
          const name = agent ? agent.persona.name : log.agentId.slice(0, 8);
          const time = new Date(log.startedAt).toLocaleTimeString();
          const isPublished = log.outcome === 'published';
          const isError = log.outcome === 'error';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                background: 'rgba(20, 20, 32, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: '#71717a', fontSize: '11px', flexShrink: 0 }}>[{time}]</span>
              <span style={{ color: '#818cf8', fontWeight: 600, flexShrink: 0 }}>[{name}]</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: isPublished ? 'rgba(16, 185, 129, 0.15)' : isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isPublished ? '#10b981' : isError ? '#ef4444' : '#f59e0b',
                border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.3)' : isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                flexShrink: 0,
              }}>
                {log.outcome.replace(/_/g, ' ')}
              </span>
              {log.detail && <span style={{ color: '#9d9db8', fontSize: '12px', flex: 1, minWidth: 0 }}>{log.detail}</span>}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
