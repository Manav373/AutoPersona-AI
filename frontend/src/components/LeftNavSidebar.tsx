import React from 'react';
import {
  Sparkles, Home, Newspaper, ListChecks, Workflow,
  LayoutDashboard, KeyRound, Variable, Settings, Plus,
  ChevronDown, Sun, Moon, HelpCircle, LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenProfileModal?: () => void;
  onOpenHelpModal?: () => void;
  onOpenLogoutModal?: () => void;
}

const navItems: { view: NavView; icon: React.ElementType; label: string; section: 'nav' | 'system' }[] = [
  { view: 'overview', icon: Home, label: 'Overview', section: 'nav' },
  { view: 'feed', icon: Newspaper, label: 'Feed', section: 'nav' },
  { view: 'executions', icon: ListChecks, label: 'Executions', section: 'nav' },
  { view: 'workflows', icon: Workflow, label: 'Workflows', section: 'nav' },
  { view: 'templates', icon: LayoutDashboard, label: 'Templates', section: 'nav' },
  { view: 'credentials', icon: KeyRound, label: 'Credentials', section: 'system' },
  { view: 'variables', icon: Variable, label: 'Variables', section: 'system' },
  { view: 'settings', icon: Settings, label: 'Logs', section: 'system' },
];

export const LeftNavSidebar: React.FC<LeftNavSidebarProps> = ({
  agents,
  selectedAgentId,
  activeView,
  onSelectAgent,
  onChangeView,
  onOpenCreateModal,
  postsCount,
  theme = 'dark',
  onToggleTheme,
  onOpenProfileModal,
  onOpenHelpModal,
  onOpenLogoutModal,
}) => {
  const navGroup = navItems.filter((n) => n.section === 'nav');
  const systemGroup = navItems.filter((n) => n.section === 'system');

  return (
    <aside style={{
      width: '220px', minWidth: '220px', background: '#09090b',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex',
      flexDirection: 'column', height: '100vh', zIndex: 20, justifyContent: 'space-between',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Brand Header */}
        <div style={{ padding: '18px 16px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.35)', flexShrink: 0,
          }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CogniPulse</span>
        </div>

        {/* Main Menu Links */}
        <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px 4px' }}>
            Navigation
          </div>
          {navGroup.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <motion.button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  borderRadius: '6px', color: isActive ? (theme === 'light' ? '#4f46e5' : '#ffffff') : 'var(--text-muted)', fontSize: '12px',
                  fontWeight: isActive ? 700 : 500, cursor: 'pointer', border: 'none',
                  background: isActive ? (theme === 'light' ? 'rgba(79, 70, 229, 0.12)' : 'rgba(99, 102, 241, 0.15)') : 'transparent',
                  width: '100%', textAlign: 'left', position: 'relative', fontFamily: 'Inter, sans-serif',
                }}
              >
                <Icon size={14} color={isActive ? (theme === 'light' ? '#4f46e5' : '#818cf8') : 'var(--text-muted)'} />
                {item.label}
                {item.view === 'feed' && postsCount > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '100px',
                  }}>
                    {postsCount}
                  </span>
                )}
              </motion.button>
            );
          })}

          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 12px' }} />

          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px' }}>
            System
          </div>
          {systemGroup.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <motion.button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  borderRadius: '6px', color: isActive ? (theme === 'light' ? '#4f46e5' : '#ffffff') : 'var(--text-muted)', fontSize: '12px',
                  fontWeight: isActive ? 700 : 500, cursor: 'pointer', border: 'none',
                  background: isActive ? (theme === 'light' ? 'rgba(79, 70, 229, 0.12)' : 'rgba(99, 102, 241, 0.15)') : 'transparent',
                  width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                }}
              >
                <Icon size={14} color={isActive ? (theme === 'light' ? '#4f46e5' : '#818cf8') : 'var(--text-muted)'} />
                {item.label}
              </motion.button>
            );
          })}

          {/* YOUR AGENTS */}
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 12px 4px' }}>
            Agents
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {agents.map((agent) => {
              const isActive = selectedAgentId === agent.agentId;
              return (
                <motion.button
                  key={agent.agentId}
                  onClick={() => {
                    onSelectAgent(agent.agentId);
                    onChangeView('persona');
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px',
                    borderRadius: '8px', cursor: 'pointer', border: 'none',
                    background: isActive ? (theme === 'light' ? 'rgba(79, 70, 229, 0.12)' : 'rgba(99, 102, 241, 0.12)') : 'transparent',
                    width: '100%', textAlign: 'left', color: isActive ? (theme === 'light' ? '#4f46e5' : '#ffffff') : 'var(--text-secondary)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: '#ffffff', flexShrink: 0,
                  }}>
                    {agent.persona.name[0]}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {agent.persona.name}
                  </span>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: agent.status === 'active' ? '#22c55e' : 'var(--text-muted)',
                    flexShrink: 0,
                  }} />
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={onOpenCreateModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              margin: '10px 4px 4px', padding: '8px 12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary-light)',
              border: '1px dashed rgba(99, 102, 241, 0.25)', borderRadius: '6px',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Plus size={13} /> New Agent
          </motion.button>
        </div>
      </div>

      {/* Profile Footer */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div 
          onClick={onOpenProfileModal}
          style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '11px', color: '#ffffff',
          }}>
            A
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Aarav Mehta</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pro Plan</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ padding: '8px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onToggleTheme}
            style={{ background: 'none', border: 'none', color: theme === 'light' ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'light' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} />}
          </button>
          <button onClick={onOpenHelpModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Help"><HelpCircle size={13} /></button>
          <button onClick={onOpenLogoutModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Logout"><LogOut size={13} /></button>
        </div>
      </div>
    </aside>
  );
};
