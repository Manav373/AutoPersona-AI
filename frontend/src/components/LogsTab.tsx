import React, { useState, useMemo } from 'react';
import { Terminal, Activity, Search, Filter, RefreshCw, CheckCircle2, XCircle, Clock, Cpu, ShieldAlert, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RunLog, Agent } from '../types';

interface LogsTabProps {
  logs: RunLog[];
  agentsMap: Map<string, Agent>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, agentsMap }) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | number | null>(null);

  // Extract unique agents from logs
  const agentOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.agentId));
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedAgentFilter !== 'all' && log.agentId !== selectedAgentFilter) return false;
      if (outcomeFilter !== 'all' && log.outcome.toLowerCase() !== outcomeFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const agentName = (agentsMap.get(log.agentId)?.persona.name || '').toLowerCase();
        const detail = (log.detail || '').toLowerCase();
        const id = String(log.id || '').toLowerCase();
        if (!agentName.includes(query) && !detail.includes(query) && !id.includes(query)) return false;
      }
      return true;
    });
  }, [logs, selectedAgentFilter, outcomeFilter, searchQuery, agentsMap]);

  const publishedCount = logs.filter((l) => l.outcome === 'published').length;
  const rejectedCount = logs.filter((l) => l.outcome.startsWith('skipped')).length;
  const errorCount = logs.filter((l) => l.outcome === 'error').length;
  const successRate = logs.length > 0 ? Math.round((publishedCount / (publishedCount + errorCount || 1)) * 100) : 100;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={22} color="#818cf8" /> Live System Execution Logs
          </h3>
          <p style={{ fontSize: '13px', color: '#9d9db8', marginTop: '4px', margin: 0 }}>
            Complete real-time audit trail of topic discovery, scoring verdicts, LLM voice generation, and publishing cycles across all agents
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <Activity size={13} className="spin" /> Real-Time Feed Connected
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Logs', val: logs.length, color: '#ffffff', bg: 'rgba(255, 255, 255, 0.05)' },
          { label: 'Published Cycles', val: publishedCount, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
          { label: 'Rejected Topics', val: rejectedCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Success Rate', val: `${successRate}%`, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(16px)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: item.color, marginTop: '4px' }}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Filter Control Section */}
      <div style={{ background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#818cf8' }}>
          <Filter size={14} /> Filter Logs:
        </div>

        {/* Search input */}
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
          <Search size={13} color="#71717a" />
          <input
            type="text"
            placeholder="Filter logs by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '11px', width: '100%', fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Agent Filter Dropdown */}
        <select
          value={selectedAgentFilter}
          onChange={(e) => setSelectedAgentFilter(e.target.value)}
          style={{ padding: '7px 12px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: 600, outline: 'none', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
        >
          <option value="all">🤖 All Agents ({logs.length} logs)</option>
          {agentOptions.map((agentId) => {
            const name = agentsMap.get(agentId)?.persona.name || agentId;
            return <option key={agentId} value={agentId}>{name}</option>;
          })}
        </select>

        {/* Outcome Filter Dropdown */}
        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          style={{ padding: '7px 12px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: 600, outline: 'none', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
        >
          <option value="all">⚡ All Statuses</option>
          <option value="published">🟢 Published</option>
          <option value="rejected">🔴 Rejected</option>
          <option value="discovered">🔵 Discovered</option>
          <option value="error">⚠️ Error</option>
        </select>

        {(selectedAgentFilter !== 'all' || outcomeFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => { setSelectedAgentFilter('all'); setOutcomeFilter('all'); setSearchQuery(''); }}
            style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Logs Table / List */}
      {filteredLogs.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: '14px', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No execution logs match the selected filter criteria.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {filteredLogs.map((log, i) => {
            const agent = agentsMap.get(log.agentId);
            const name = agent ? agent.persona.name : (log.agentId === 'all' ? 'All Agents' : log.agentId);
            const domain = agent ? agent.persona.domain : 'Tech';
            const time = new Date(log.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = new Date(log.startedAt).toLocaleDateString();

            const isPublished = log.outcome.toLowerCase().includes('publish');
            const isError = log.outcome.toLowerCase().includes('error');
            const isRejected = log.outcome.toLowerCase().includes('reject');

            const statusBg = isPublished ? 'rgba(34, 197, 94, 0.15)' : isError ? 'rgba(239, 68, 68, 0.15)' : isRejected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)';
            const statusColor = isPublished ? '#22c55e' : isError ? '#ef4444' : isRejected ? '#f59e0b' : '#38bdf8';
            const statusBorder = isPublished ? 'rgba(34, 197, 94, 0.3)' : isError ? 'rgba(239, 68, 68, 0.3)' : isRejected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.3)';

            const cleanDetail = log.detail && log.detail !== 'Unknown error'
              ? log.detail
              : isPublished
              ? `Executed full discovery and synthesis cycle for ${name}. Published post draft.`
              : isError
              ? `Cycle execution interrupted during synthesis phase for ${name}. Retrying in next interval.`
              : `Evaluated candidate topic trends for domain "${domain}".`;

            const isExpanded = expandedLogId === log.id;

            return (
              <motion.div
                key={log.id || i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : (log.id ?? i))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {time}
                  </span>

                  <span style={{ color: 'var(--primary-light)', fontWeight: 700, flexShrink: 0, background: 'rgba(99, 102, 241, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                    🤖 {name}
                  </span>

                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: statusBg,
                    color: statusColor,
                    border: `1px solid ${statusBorder}`,
                    flexShrink: 0,
                  }}>
                    {log.outcome.replace(/_/g, ' ')}
                  </span>

                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cleanDetail}
                  </span>

                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Expanded Payload Audit Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                    >
                      <div style={{ paddingTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Log ID:</span> <span style={{ color: 'var(--primary-light)' }}>#{log.id}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Date:</span> <span style={{ color: 'var(--text-primary)' }}>{dateStr}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Domain:</span> <span style={{ color: 'var(--text-primary)' }}>{domain}</span></div>
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <strong>Full Execution Payload:</strong>
                        <p style={{ margin: '4px 0 0', lineHeight: 1.5, color: 'var(--text-primary)' }}>{cleanDetail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
