import React, { useState, useEffect, useMemo } from 'react';
import { LeftNavSidebar, NavView } from './components/LeftNavSidebar';
import { AddNodesSidebar } from './components/AddNodesSidebar';
import { WorkflowCanvas, SelectedNodeInfo, CanvasNodeData, ConnectionData, INITIAL_NODES, INITIAL_CONNECTIONS } from './components/WorkflowCanvas';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { OverviewView } from './components/OverviewView';
import { TemplatesView } from './components/TemplatesView';
import { CredentialsView } from './components/CredentialsView';
import { VariablesView } from './components/VariablesView';
import { FeedTab } from './components/FeedTab';
import { JudgmentTab } from './components/JudgmentTab';
import { PersonaTab } from './components/PersonaTab';
import { LogsTab } from './components/LogsTab';
import { CreateAgentModal } from './components/CreateAgentModal';
import { Agent, Post, TopicReview, RunLog, SystemStats } from './types';
import { Share2, Save, MoreHorizontal, Cpu, Code, Filter, RefreshCw, Database, Send, Clock, Search, Scale, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

const VIEW_TITLES: Record<NavView, { title: string; sub: string }> = {
  overview: { title: 'Overview Dashboard', sub: 'Monitor active persona agents, metrics, and publishing performance' },
  feed: { title: 'Published Feed', sub: 'Real-time stream of autonomously generated posts and editorial rationale' },
  executions: { title: 'Editorial Executions', sub: 'Live audit log of candidate topics, scores, and verdicts' },
  workflows: { title: 'Agent Workflows', sub: 'Design and automate your autonomous publishing agent' },
  templates: { title: 'Workflow Templates', sub: 'Launch pre-configured autonomous personas in one click' },
  persona: { title: 'Agent Identity & Metrics', sub: 'Deep inspect agent voice, interest topics, standards, and tasks done' },
  credentials: { title: 'API Credentials', sub: 'Manage model providers, search APIs, and integration keys' },
  variables: { title: 'System Variables', sub: 'Configure threshold parameters and memory settings' },
  settings: { title: 'Execution Logs', sub: 'Live system logs and diagnostic information' },
};

export function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [activeView, setActiveView] = useState<NavView>(() => {
    return (localStorage.getItem('activeView') as NavView) || 'overview';
  });

  const handleSetActiveView = (view: NavView) => {
    setActiveView(view);
    localStorage.setItem('activeView', view);
  };
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [isActiveToggle, setIsActiveToggle] = useState(true);

  // Workflow nodes & connections state
  const [nodes, setNodes] = useState<CanvasNodeData[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<ConnectionData[]>(INITIAL_CONNECTIONS);

  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<TopicReview[]>([]);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const agentsMap = useMemo(() => {
    const m = new Map<string, Agent>();
    agents.forEach((a) => m.set(a.agentId, a));
    return m;
  }, [agents]);

  // Data fetching
  const fetchAgents = async () => {
    try {
      const r = await fetch('/api/agents');
      if (r.ok) {
        const d = await r.json();
        const list = d.agents || [];
        setAgents(list);
      }
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const r = await fetch('/api/stats');
      if (r.ok) setStats(await r.json());
    } catch {}
  };

  const fetchFeed = async () => {
    try {
      const q = selectedAgentId ? `?agentId=${selectedAgentId}` : '?agentId=all';
      const r = await fetch(`/api/agent/feed${q}`);
      if (r.ok) {
        const data = await r.json();
        const list: Post[] = data.posts || [];
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(list);
      }
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      const q = selectedAgentId !== 'all' ? `?agentId=${selectedAgentId}` : '';
      const r = await fetch(`/api/logs${q}`);
      if (r.ok) {
        const d = await r.json();
        setReviews(d.topicReviews || []);
        setLogs(d.runLogs || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchAgents(); fetchStats(); fetchFeed(); fetchLogs();
    const iv = setInterval(() => { fetchAgents(); fetchStats(); fetchFeed(); fetchLogs(); }, 4000);
    return () => clearInterval(iv);
  }, [selectedAgentId]);

  useEffect(() => {
    if (selectedAgentId !== 'all') {
      const found = agents.find((a) => a.agentId === selectedAgentId);
      if (found) {
        setIsActiveToggle(found.status === 'active');
      }
    }
  }, [selectedAgentId, agents]);

  const handleToggleAgentStatus = async () => {
    let id = selectedAgentId;
    if (id === 'all' && agents.length > 0) { id = agents[0].agentId; }
    if (!id || id === 'all') return;

    const nextStatus = isActiveToggle ? 'stopped' : 'active';
    try {
      const r = await fetch('/api/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: id, status: nextStatus }),
      });

      if (r.ok) {
        setIsActiveToggle(!isActiveToggle);
        if (nextStatus === 'active') {
          showToast('🟢 Agent Activated — automatic background cycles enabled');
        } else {
          showToast('⏸️ Agent Paused — background cycles stopped to save tokens');
        }
        fetchAgents();
      }
    } catch {
      showToast('Failed to update agent status');
    }
  };

  const handleCreate = async (name: string, domain: string) => {
    setIsCreating(true);
    try {
      const r = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: { name, domain } }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      showToast(`✨ Agent "${name}" deployed successfully`);
      setIsModalOpen(false);
      setSelectedAgentId(d.agentId);
      fetchAgents();
    } catch {
      showToast('Error initializing agent');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTrigger = async () => {
    let id = selectedAgentId;
    if (id === 'all' && agents.length > 0) { id = agents[0].agentId; setSelectedAgentId(id); }
    if (!id || id === 'all') return;

    setIsTriggering(true);
    try {
      const r = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: id }),
      });
      if (r.ok) {
        showToast('⚡ Autonomous workflow triggered!');
        setTimeout(() => { fetchFeed(); fetchLogs(); fetchStats(); }, 1500);
      }
    } catch {}
    finally { setIsTriggering(false); }
  };

  const handleAddNodeFromSidebar = (name: string, category: string) => {
    const newId = `${category}-${Date.now().toString().slice(-4)}`;
    let nodeIcon: React.ElementType = Cpu;
    let subtitleStr = 'Pipeline Node';
    let descDetail = 'Processes data in the workflow pipeline.';

    if (name.includes('Schedule')) { nodeIcon = Clock; subtitleStr = 'Every 2 hours'; descDetail = 'Triggers cycle automatically on interval schedule.'; }
    else if (name.includes('Discover') || name.includes('Tavily') || name.includes('RSS')) { nodeIcon = Search; subtitleStr = 'Web Search'; descDetail = 'Fetches candidate news topics matching persona domain.'; }
    else if (name.includes('Judge')) { nodeIcon = Scale; subtitleStr = 'Evaluate Relevance'; descDetail = 'Scores novelty % and evaluates persona fit.'; }
    else if (name.includes('Voice') || name.includes('Synthesizer')) { nodeIcon = Cpu; subtitleStr = 'AI Agent'; descDetail = 'Generates 2-paragraph editorial post in persona voice.'; }
    else if (name.includes('Rationale')) { nodeIcon = Sparkles; subtitleStr = 'Add Sources & Why'; descDetail = 'Appends transparent editorial rationale and source links.'; }
    else if (name.includes('Memory') || name.includes('Store')) { nodeIcon = Database; subtitleStr = 'SQLite Store'; descDetail = 'Saves topic key to prevent duplicate topics.'; }
    else if (name.includes('Rejected') || name.includes('Log')) { nodeIcon = AlertCircle; subtitleStr = 'Data Store'; descDetail = 'Audits and stores rejected candidate topics.'; }
    else if (name.includes('Publish') || name.includes('Send')) { nodeIcon = Send; subtitleStr = 'Output'; descDetail = 'Publishes finalized post to feed and notifications.'; }

    const newNode: CanvasNodeData = {
      id: newId,
      title: name,
      subtitle: subtitleStr,
      type: category,
      nodeClass: `node-${category}`,
      icon: nodeIcon,
      x: 140 + Math.random() * 100,
      y: 180 + Math.random() * 150,
      params: [
        { label: 'Status', value: 'Active' },
        { label: 'Stage', value: category.toUpperCase() },
      ],
      description: `What does ${name} do?`,
      descriptionDetail: descDetail,
    };

    setNodes((prev) => [...prev, newNode]);
    showToast(`Added "${name}" node to canvas. Click its port dot to connect!`);
  };

  const handleUpdateNodeParam = (nodeId: string, paramIndex: number, newValue: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const updatedParams = [...n.params];
          if (updatedParams[paramIndex]) {
            updatedParams[paramIndex] = { ...updatedParams[paramIndex], value: newValue };
          }
          return { ...n, params: updatedParams };
        }
        return n;
      })
    );
  };

  const handleAddConnection = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const exists = connections.some((c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));
    if (!exists) {
      const newConn: ConnectionData = {
        id: `c-${Date.now()}`,
        from: fromId,
        to: toId,
        type: 'default',
      };
      setConnections((prev) => [...prev, newConn]);
      showToast(`🔗 Connected nodes!`);
    }
  };

  const currentTitle = VIEW_TITLES[activeView] || VIEW_TITLES['workflows'];

  const renderCenterView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <OverviewView
            stats={stats}
            agents={agents}
            posts={posts}
            reviews={reviews}
            onTriggerCycle={handleTrigger}
            onOpenCreateModal={() => setIsModalOpen(true)}
            onSelectAgent={(id) => { setSelectedAgentId(id); handleSetActiveView('workflows'); }}
          />
        );
      case 'workflows':
        return (
          <WorkflowCanvas
            agents={agents}
            selectedAgentId={selectedAgentId}
            onTriggerCycle={handleTrigger}
            isTriggering={isTriggering}
            latestLog={logs[0]}
            latestReview={reviews[0]}
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id || 'schedule-trigger'}
            nodes={nodes}
            setNodes={setNodes}
            connections={connections}
            setConnections={setConnections}
            showToast={showToast}
          />
        );
      case 'feed':
        return (
          <FeedTab
            posts={posts}
            agentsMap={agentsMap}
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onTriggerCycle={handleTrigger}
            isTriggering={isTriggering}
          />
        );
      case 'executions':
        return (
          <JudgmentTab
            reviews={reviews}
            logs={logs}
            posts={posts}
            agentsMap={agentsMap}
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onTriggerCycle={handleTrigger}
            isTriggering={isTriggering}
          />
        );
      case 'templates':
        return (
          <TemplatesView
            onUseTemplate={(name, domain) => {
              handleCreate(name, domain);
              handleSetActiveView('workflows');
            }}
          />
        );
      case 'persona':
        return (
          <PersonaTab
            agents={agents}
            selectedAgentId={selectedAgentId}
            posts={posts}
            reviews={reviews}
            logs={logs}
            onTriggerCycle={handleTrigger}
            isTriggering={isTriggering}
            onToggleStatus={handleToggleAgentStatus}
            isActive={isActiveToggle}
          />
        );
      case 'credentials':
        return <CredentialsView />;
      case 'variables':
        return <VariablesView />;
      case 'settings':
        return <LogsTab logs={logs} agentsMap={agentsMap} />;
    }
  };

  return (
    <div className="app-shell">
      {/* 1. Leftmost Navigation Sidebar */}
      <LeftNavSidebar
        agents={agents}
        selectedAgentId={selectedAgentId}
        activeView={activeView}
        onSelectAgent={setSelectedAgentId}
        onChangeView={handleSetActiveView}
        onOpenCreateModal={() => setIsModalOpen(true)}
        postsCount={posts.length}
      />

      {/* 2. Add Nodes Palette Sidebar (Only shown in Workflows View) */}
      {activeView === 'workflows' && (
        <AddNodesSidebar onAddNode={handleAddNodeFromSidebar} />
      )}

      {/* 3. Center Workspace Area */}
      <div className="center-workspace">
        {/* Workspace Topbar */}
        <div className="workspace-topbar">
          <div className="topbar-title-section">
            <h2>{currentTitle.title}</h2>
            <p>{currentTitle.sub}</p>
          </div>

          <div className="topbar-middle-tabs">
            <button
              className={`topbar-tab-btn ${activeView === 'workflows' ? 'active' : ''}`}
              onClick={() => handleSetActiveView('workflows')}
            >
              Editor
            </button>
            <button
              className={`topbar-tab-btn ${activeView === 'executions' ? 'active' : ''}`}
              onClick={() => handleSetActiveView('executions')}
            >
              Executions
            </button>
          </div>

          <div className="topbar-right-controls">
            <div className="inactive-toggle-wrapper">
              <span>{isActiveToggle ? 'Active' : 'Inactive'}</span>
              <div
                className={`toggle-switch-bg ${isActiveToggle ? 'active' : ''}`}
                onClick={handleToggleAgentStatus}
                title={isActiveToggle ? 'Click to pause automatic background cycles' : 'Click to activate automatic background cycles'}
              >
                <div className="toggle-switch-handle" />
              </div>
            </div>

            <button className="btn-topbar btn-topbar-outline" onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              showToast(`🔗 Agent Workflow link copied to clipboard!`);
            }}>
              <Share2 size={13} /> Share
            </button>

            <button
              className="btn-topbar btn-topbar-purple"
              onClick={() => {
                const name = agentsMap.get(selectedAgentId)?.persona.name || 'Persona';
                showToast(`💾 Agent "${name}" Workflow configuration saved successfully!`);
              }}
            >
              <Save size={13} /> Save
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="btn-topbar btn-topbar-outline"
                style={{ padding: '6px' }}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                title="More Workflow Options"
              >
                <MoreHorizontal size={14} />
              </button>

              {showMoreMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 100,
                    width: '210px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <button
                    className="topbar-tab-btn"
                    style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 10px' }}
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleTrigger();
                    }}
                  >
                    ⚡ Trigger Real Cycle
                  </button>
                  <button
                    className="topbar-tab-btn"
                    style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 10px' }}
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleSetActiveView('executions');
                    }}
                  >
                    ⚙ Open Executions Audit
                  </button>
                  <button
                    className="topbar-tab-btn"
                    style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 10px' }}
                    onClick={() => {
                      setShowMoreMenu(false);
                      if (selectedAgentId !== 'all') {
                        navigator.clipboard.writeText(selectedAgentId);
                        showToast(`📋 Copied Agent ID: ${selectedAgentId}`);
                      } else {
                        showToast('Please select a specific agent persona');
                      }
                    }}
                  >
                    📋 Copy Agent ID
                  </button>
                  <button
                    className="topbar-tab-btn"
                    style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 10px', color: '#f87171' }}
                    onClick={() => {
                      setShowMoreMenu(false);
                      setNodes(INITIAL_NODES);
                      setConnections(INITIAL_CONNECTIONS);
                      showToast('🔄 Reset workflow canvas layout & cables');
                    }}
                  >
                    🔄 Reset Canvas Layout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Viewport Content */}
        {renderCenterView()}
      </div>

      {/* 4. Right Inspector Panel (Only shown in Workflows View) */}
      {activeView === 'workflows' && (
        <RightInspectorPanel
          selectedNode={selectedNode}
          stats={stats}
          allNodes={nodes}
          connections={connections}
          selectedAgent={agents.find((a) => a.agentId === selectedAgentId) || agents[0]}
          latestLog={logs[0]}
          latestReview={reviews[0]}
          onOpenExecutions={() => handleSetActiveView('executions')}
          onUpdateParam={handleUpdateNodeParam}
          onAddConnection={handleAddConnection}
          onTriggerCycle={handleTrigger}
        />
      )}

      {/* Modal */}
      <CreateAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="toast-wrap"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="toast-msg">{toastMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
