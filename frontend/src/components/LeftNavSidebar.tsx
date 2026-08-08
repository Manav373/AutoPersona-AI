import React from 'react';
import {
  Zap, Home, Newspaper, ListChecks, Workflow,
  LayoutDashboard, KeyRound, Variable, Settings, Plus,
  ChevronDown, Sun, HelpCircle, LogOut,
} from 'lucide-react';
import { Agent } from '../types';

export type NavView = 'overview' | 'feed' | 'executions' | 'workflows' | 'templates' | 'persona' | 'credentials' | 'variables' | 'settings';

interface LeftNavSidebarProps {
  agents: Agent[];
  selectedAgentId: string;
  activeView: NavView;
  onSelectAgent: (id: string) => void;
  onChangeView: (view: NavView) => void;
  onOpenCreateModal: () => void;
  postsCount: number;
}

export const LeftNavSidebar: React.FC<LeftNavSidebarProps> = ({
  agents,
  selectedAgentId,
  activeView,
  onSelectAgent,
  onChangeView,
  onOpenCreateModal,
  postsCount,
}) => {
  return (
    <aside className="left-nav-sidebar">
      <div>
        {/* Brand Header */}
        <div className="nav-brand-header">
          <div className="brand-logo-icon">
            <Zap size={16} fill="#fff" color="#fff" />
          </div>
          <span className="brand-title">AutoPersona AI</span>
        </div>

        {/* Main Menu Links */}
        <div className="nav-menu-list">
          <button
            className={`nav-link-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => onChangeView('overview')}
          >
            <Home size={15} /> Overview
          </button>

          <button
            className={`nav-link-btn ${activeView === 'feed' ? 'active' : ''}`}
            onClick={() => onChangeView('feed')}
          >
            <Newspaper size={15} /> Feed
            {postsCount > 0 && <span className="nav-count-badge">{postsCount}</span>}
          </button>

          <button
            className={`nav-link-btn ${activeView === 'executions' ? 'active' : ''}`}
            onClick={() => onChangeView('executions')}
          >
            <ListChecks size={15} /> Executions
          </button>

          <button
            className={`nav-link-btn ${activeView === 'workflows' ? 'active' : ''}`}
            onClick={() => onChangeView('workflows')}
          >
            <Workflow size={15} /> Workflows
          </button>

          <button
            className={`nav-link-btn ${activeView === 'templates' ? 'active' : ''}`}
            onClick={() => onChangeView('templates')}
          >
            <LayoutDashboard size={15} /> Templates
          </button>

          <button
            className={`nav-link-btn ${activeView === 'credentials' ? 'active' : ''}`}
            onClick={() => onChangeView('credentials')}
          >
            <KeyRound size={15} /> Credentials
          </button>

          <button
            className={`nav-link-btn ${activeView === 'variables' ? 'active' : ''}`}
            onClick={() => onChangeView('variables')}
          >
            <Variable size={15} /> Variables
          </button>

          <button
            className={`nav-link-btn ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => onChangeView('settings')}
          >
            <Settings size={15} /> Settings
          </button>
        </div>

        {/* YOUR AGENTS */}
        <div className="nav-section-title">YOUR AGENTS</div>
        <div className="agent-nav-list">
          {agents.map((agent, i) => {
            const isActive = selectedAgentId === agent.agentId;
            return (
              <button
                key={agent.agentId}
                className={`agent-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectAgent(agent.agentId);
                  onChangeView('persona');
                }}
              >
                <div className="agent-avatar-img">{agent.persona.name[0]}</div>
                <span className="agent-nav-name">{agent.persona.name}</span>
                <span className={`status-dot-indicator ${agent.status === 'active' ? '' : 'offline'}`} />
              </button>
            );
          })}
        </div>

        <button className="btn-create-agent-nav" onClick={onOpenCreateModal}>
          <Plus size={14} /> Create New Agent
        </button>
      </div>

      {/* Profile Footer & Bottom Toolbar Pinned to Bottom */}
      <div className="nav-profile-section">
        <div className="nav-profile-footer">
          <div className="profile-avatar-circle">A</div>
          <div className="profile-info-box">
            <div className="profile-user-name">Aarav Mehta</div>
            <div className="profile-user-plan">Pro Plan</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>

        <div className="nav-bottom-toolbar">
          <button className="nav-icon-btn" title="Theme"><Sun size={14} /></button>
          <button className="nav-icon-btn" title="Help"><HelpCircle size={14} /></button>
          <button className="nav-icon-btn" title="Logout"><LogOut size={14} /></button>
        </div>
      </div>
    </aside>
  );
};
