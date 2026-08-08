import React from 'react';
import {
  Zap, LayoutDashboard, Newspaper, ListChecks, Workflow,
  BookTemplate, KeyRound, Variable, Settings, Plus, ChevronDown,
} from 'lucide-react';
import { Agent } from '../types';

type View = 'workflows' | 'feed' | 'executions' | 'persona' | 'settings';

interface SidebarProps {
  agents: Agent[];
  selectedAgentId: string;
  activeView: View;
  onSelectAgent: (id: string) => void;
  onChangeView: (v: View) => void;
  onOpenCreateModal: () => void;
  postsCount: number;
}

const NAV: { key: View; label: string; icon: React.ElementType }[] = [
  { key: 'workflows', label: 'Workflows', icon: Workflow },
  { key: 'feed', label: 'Feed', icon: Newspaper },
  { key: 'executions', label: 'Executions', icon: ListChecks },
  { key: 'persona', label: 'Persona', icon: LayoutDashboard },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  agents,
  selectedAgentId,
  activeView,
  onSelectAgent,
  onChangeView,
  onOpenCreateModal,
  postsCount,
}) => {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Zap size={16} color="#fff" />
        </div>
        <div>
          <div className="brand-name">AutoPersona AI</div>
          <div className="brand-sub">Autonomous Creator</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`nav-item ${activeView === item.key ? 'active' : ''}`}
              onClick={() => onChangeView(item.key)}
            >
              <Icon size={16} />
              {item.label}
              {item.key === 'feed' && postsCount > 0 && (
                <span className="nav-badge">{postsCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agents */}
      <div className="sidebar-section-label">Your Agents</div>
      <div className="agent-list">
        {agents.length === 0 && (
          <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-3)' }}>
            No agents yet
          </div>
        )}
        {agents.map((agent) => (
          <button
            key={agent.agentId}
            className={`agent-list-item ${selectedAgentId === agent.agentId ? 'active' : ''}`}
            onClick={() => onSelectAgent(agent.agentId)}
          >
            <span className="agent-dot" />
            <div style={{ minWidth: 0 }}>
              <div className="agent-list-name">{agent.persona.name}</div>
              <div className="agent-list-domain">{agent.persona.domain}</div>
            </div>
          </button>
        ))}
      </div>

      <button className="create-agent-btn" onClick={onOpenCreateModal}>
        <Plus size={14} />
        Create New Agent
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">A</div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">AI Creator</div>
          <div className="sidebar-footer-plan">Pro Plan</div>
        </div>
        <ChevronDown size={14} color="#5c5c7a" />
      </div>
    </aside>
  );
};
