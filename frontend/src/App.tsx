import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { UserProfileModal } from './components/UserProfileModal';
import { HelpDocModal } from './components/HelpDocModal';
import { LogoutModal } from './components/LogoutModal';
import { Agent, Post, TopicReview, RunLog, SystemStats } from './types';
import { Share2, Save, MoreHorizontal, Cpu, Code, Filter, RefreshCw, Database, Send, Clock, Search, Scale, Sparkles, AlertCircle, Bell, Zap, Activity, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('autopersona_theme') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('autopersona_theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  const [nodes, setNodes] = useState<CanvasNodeData[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<ConnectionData[]>(INITIAL_CONNECTIONS);

  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<TopicReview[]>([]);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.removeItem('autopersona_session');
    showToast('🔒 Logged out safely. Redirecting to Landing Page...');
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const agentsMap = useMemo(() => {
    const m = new Map<string, Agent>();
    agents.forEach((a) => m.set(a.agentId, a));
    return m;
  }, [agents]);

  const fetchAgents = async () => {
    try {
      const r = await fetch('/api/agents');
      if (r.ok) {
        const d = await r.json();
        setAgents(d.agents || []);
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
      if (found) setIsActiveToggle(found.status === 'active');
    }
  }, [selectedAgentId, agents]);

  const handleToggleAgentStatus = async () => {
    let id = selectedAgentId;
    if (id === 'all' && agents.length > 0) id = agents[0].agentId;
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
            onSelectAgent={setSelectedAgentId}
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* 1. Leftmost Navigation Sidebar */}
      <LeftNavSidebar
        agents={agents}
        selectedAgentId={selectedAgentId}
        activeView={activeView}
        onSelectAgent={setSelectedAgentId}
        onChangeView={handleSetActiveView}
        onOpenCreateModal={() => setIsModalOpen(true)}
        postsCount={posts.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Add Nodes Palette Sidebar */}
      {activeView === 'workflows' && (
        <AddNodesSidebar onAddNode={handleAddNodeFromSidebar} />
      )}

      {/* 3. Center Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--bg-canvas)' }}>
        {/* Workspace Topbar */}
        <div style={{
          height: '44px', padding: '0 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-topbar, rgba(9, 9, 11, 0.85))', zIndex: 10, flexShrink: 0, backdropFilter: 'blur(16px)',
        }}>
          {/* Left: View Title & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', flexShrink: 0 }} />
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>{currentTitle.title}</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{currentTitle.sub}</span>
          </div>

          {/* Right: Persona Selector & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle Button */}
            <motion.button
              onClick={handleToggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '4px 10px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', borderRadius: '6px',
                color: theme === 'light' ? '#f59e0b' : '#a1a1aa', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                fontFamily: 'Inter, sans-serif',
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'light' ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} />}
              <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
            </motion.button>

            {/* Agent Persona Filter */}
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              style={{
                padding: '4px 10px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', borderRadius: '6px',
                color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600, outline: 'none',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              <option value="all">🤖 All Active Personas ({agents.length})</option>
              {agents.map((a) => (
                <option key={a.agentId} value={a.agentId}>
                  {a.persona.name} — {a.persona.domain}
                </option>
              ))}
            </select>

            {/* Quick Trigger Button */}
            <motion.button
              onClick={handleTrigger}
              disabled={isTriggering}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '4px 12px', borderRadius: '6px', fontSize: '11px',
                fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', color: '#ffffff', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
                opacity: isTriggering ? 0.7 : 1,
              }}
              title="Trigger real workflow cycle"
            >
              <Zap size={12} className={isTriggering ? 'spin' : ''} />
              {isTriggering ? 'Running...' : 'Run Cycle'}
            </motion.button>
          </div>
        </div>

        {/* Viewport Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: activeView === 'workflows' ? 'hidden' : 'auto', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          {renderCenterView()}
        </div>
      </div>

      {/* 4. Right Inspector Panel */}
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

      {/* Modals */}
      <CreateAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        showToast={showToast}
      />

      <HelpDocModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{
              position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 2000, pointerEvents: 'none',
            }}
          >
            <div
              className="app-toast-pill"
              style={{
                background: '#0f172a', border: '1px solid #334155',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)', color: '#ffffff',
                padding: '10px 22px', borderRadius: '100px', fontSize: '12px',
                fontWeight: 700, whiteSpace: 'nowrap', backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
