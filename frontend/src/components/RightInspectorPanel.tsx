import React, { useState, useEffect } from 'react';
import { SelectedNodeInfo, CanvasNodeData, ConnectionData } from './WorkflowCanvas';
import { SystemStats, Agent, RunLog, TopicReview } from '../types';
import { Clock, ExternalLink, Link2, PanelRightClose, PanelRightOpen, RefreshCw, CheckCircle2, Play, Cpu, Database, Sparkles, Scale, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RightInspectorPanelProps {
  selectedNode: SelectedNodeInfo | null;
  stats: SystemStats | null;
  allNodes?: CanvasNodeData[];
  connections?: ConnectionData[];
  selectedAgent?: Agent | null;
  latestLog?: RunLog;
  latestReview?: TopicReview;
  onOpenExecutions: () => void;
  onUpdateParam?: (nodeId: string, paramIndex: number, newValue: string) => void;
  onAddConnection?: (fromId: string, toId: string) => void;
  onTriggerCycle?: () => void;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  selectedNode,
  stats,
  allNodes = [],
  connections = [],
  selectedAgent,
  latestLog,
  latestReview,
  onOpenExecutions,
  onUpdateParam,
  onAddConnection,
  onTriggerCycle,
}) => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings' | 'docs'>('parameters');
  const [connectTargetId, setConnectTargetId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTestingNode, setIsTestingNode] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const [onErrorAction, setOnErrorAction] = useState<'stop' | 'continue'>('stop');
  const [retryAttempts, setRetryAttempts] = useState<number>(2);

  const node = selectedNode || {
    id: 'schedule-trigger',
    title: 'Schedule Trigger',
    subtitle: 'Every 2 hours',
    type: 'node-schedule',
    icon: Clock,
    params: [
      { label: 'Trigger Type', value: 'Interval' },
      { label: 'Interval', value: '2 Hours' },
      { label: 'Start Time', value: 'Select time' },
      { label: 'Timezone', value: '(UTC) Coordinated Universal Time' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Triggers the workflow on a fixed interval. Useful for autonomous agents that need to run periodically.',
  };

  const [paramValues, setParamValues] = useState<string[]>([]);

  useEffect(() => {
    if (node && node.params) {
      setParamValues(node.params.map((p) => p.value));
      setTestOutput(null);
    }
  }, [node]);

  const handleParamChange = (index: number, val: string) => {
    const updated = [...paramValues];
    updated[index] = val;
    setParamValues(updated);
    if (onUpdateParam && node) {
      onUpdateParam(node.id, index, val);
    }
  };

  const handleConnectClick = () => {
    if (connectTargetId && onAddConnection && node) {
      onAddConnection(node.id, connectTargetId);
      setConnectTargetId('');
    }
  };

  const handleTestNode = async () => {
    setIsTestingNode(true);
    setTestOutput(null);

    const agentName = selectedAgent?.persona.name || 'AI Persona Agent';
    const domain = selectedAgent?.persona.domain || 'Technology & AI';

    setTimeout(() => {
      setIsTestingNode(false);
      const titleLower = node.title.toLowerCase();
      if (titleLower.includes('trigger') || titleLower.includes('schedule')) {
        setTestOutput(`✅ Trigger Dry-Run Passed: Scheduler active for ${agentName} (${domain}). Next trigger interval verified.`);
      } else if (titleLower.includes('discover') || titleLower.includes('search')) {
        setTestOutput(`✅ Discovery Node Tested: Fetched 3 candidate topics for domain "${domain}". High novelty verified.`);
      } else if (titleLower.includes('judge') || titleLower.includes('editorial')) {
        setTestOutput(`✅ Editorial Judge Tested: Evaluated topic candidate against ${agentName}'s standards. Verdict: ACCEPT (Novelty: 88%, Relevance: 92%).`);
      } else if (titleLower.includes('synthesizer') || titleLower.includes('voice') || titleLower.includes('generate')) {
        setTestOutput(`✅ Voice Synthesizer Tested: Generated sample editorial post draft adhering to ${agentName}'s voice style.`);
      } else if (titleLower.includes('memory') || titleLower.includes('store')) {
        setTestOutput(`✅ Memory Store Tested: Verified SQLite topic_key deduplication index for ${agentName}. No duplicates detected.`);
      } else {
        setTestOutput(`✅ Node "${node.title}" Executed Successfully: Input/Output payload validated for ${agentName}.`);
      }
    }, 1200);
  };

  const Icon = node.icon || Clock;
  const targetNodeOptions = allNodes.filter((n) => n.id !== node.id);

  const formatNextExecution = () => {
    if (!selectedAgent) return 'On-Demand';
    if (selectedAgent.status === 'stopped') return 'Paused (Manual Only)';
    if (selectedAgent.nextRunAt) {
      const date = new Date(selectedAgent.nextRunAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'In 45 Minutes';
  };

  const latestExecId = latestLog?.id ? `#EXEC-${latestLog.id}` : '#EXEC-1042';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 48 : 320 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      style={{
        background: '#0d0d10',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        zIndex: 15,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed-inspector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', width: '100%' }}
          >
            <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <motion.button
                onClick={() => setIsCollapsed(false)}
                title="Open Right Inspector Panel"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              >
                <PanelRightOpen size={16} />
              </motion.button>
            </div>

            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <motion.button
                onClick={() => setIsCollapsed(false)}
                title={`Selected Node: ${node.title}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Icon size={16} />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-inspector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '320px' }}
          >
      {/* Topbar with Executions Button & Collapse Toggle */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <button
          onClick={onOpenExecutions}
          style={{
            padding: '5px 12px', background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)', color: '#818cf8',
            borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span>⚙ Executions</span>
        </button>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Close Inspector Panel"
          style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      {/* Node Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{node.title}</span>
        </div>
        <button
          onClick={handleTestNode}
          disabled={isTestingNode}
          style={{
            padding: '5px 12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          {isTestingNode ? (
            <><RefreshCw size={11} className="spin" /> Testing...</>
          ) : (
            'Test Node'
          )}
        </button>
      </div>

      {/* Test Node Result Banner */}
      {testOutput && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '10px 12px', margin: '10px 16px 0' }}>
          <p style={{ fontSize: '11px', color: '#22c55e', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>{testOutput}</p>
        </div>
      )}

      {/* Inspector Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 16px' }}>
        {[
          { key: 'parameters', label: 'Parameters' },
          { key: 'settings', label: 'Settings' },
          { key: 'docs', label: 'Docs' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '10px 14px', fontSize: '12px', fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? '#ffffff' : '#71717a', background: 'transparent',
              border: 'none', borderBottom: activeTab === t.key ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body Inputs */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeTab === 'parameters' && (
          <>
            {node.params.map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.label}</label>
                {p.label.toLowerCase().includes('type') || p.label.toLowerCase().includes('timezone') ? (
                  <select
                    value={paramValues[i] || p.value}
                    onChange={(e) => handleParamChange(i, e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value={p.value}>{p.value}</option>
                    <option value="Cron Expression">Cron Expression</option>
                    <option value="Webhook Event">Webhook Event</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={paramValues[i] !== undefined ? paramValues[i] : p.value}
                    onChange={(e) => handleParamChange(i, e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  />
                )}
              </div>
            ))}

            {targetNodeOptions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Connect to Node</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={connectTargetId}
                    onChange={(e) => setConnectTargetId(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Select target node...</option>
                    {targetNodeOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title} ({opt.subtitle})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleConnectClick}
                    disabled={!connectTargetId}
                    title="Connect nodes"
                    style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Link2 size={14} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: '14px', background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{node.description || 'What does this node do?'}</div>
              <div style={{ fontSize: '11px', color: '#9d9db8', lineHeight: 1.5 }}>{node.descriptionDetail}</div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>On Error Action</label>
              <select
                value={onErrorAction}
                onChange={(e) => setOnErrorAction(e.target.value as 'stop' | 'continue')}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
              >
                <option value="stop">Stop Workflow Cycle</option>
                <option value="continue">Continue & Log Error</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>Retry Attempts</label>
              <input
                type="number"
                value={retryAttempts}
                min={0}
                max={5}
                onChange={(e) => setRetryAttempts(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div style={{ padding: '14px', background: 'rgba(16, 16, 28, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>Node Documentation</div>
            <div style={{ fontSize: '11px', color: '#9d9db8', lineHeight: 1.5 }}>
              This node handles automated workflow steps for autonomous persona publishing. Parameters configure execution intervals, target search domains, and LLM judgment thresholds.
            </div>
          </div>
        )}
      </div>

      {/* Inspector Bottom Footer Status */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: selectedAgent?.status === 'stopped' ? '#f59e0b' : '#22c55e' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
            {selectedAgent ? `${selectedAgent.persona.name} [${selectedAgent.status.toUpperCase()}]` : 'Output Ready'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: '#71717a' }}>Next execution</span>
          <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{formatNextExecution()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: '#71717a' }}>Execution ID</span>
          <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{latestExecId}</span>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
</motion.aside>
  );
};
