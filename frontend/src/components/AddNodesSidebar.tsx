import React, { useState } from 'react';
import {
  Search, Clock, Globe, Play, Scale, Cpu, FileText,
  Database, Send, Sparkles, AlertCircle, RefreshCw, Rss,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AddNodesSidebarProps {
  onAddNode: (name: string, category: string) => void;
}

export const AddNodesSidebar: React.FC<AddNodesSidebarProps> = ({ onAddNode }) => {
  const [search, setSearch] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const groups = [
    {
      title: 'TRIGGER',
      category: 'trigger',
      items: [
        { name: 'Schedule Trigger', type: 'trigger', icon: Clock, desc: 'Fires every N hours' },
        { name: 'Manual Trigger', type: 'trigger', icon: Play, desc: 'Trigger on demand' },
        { name: 'Webhook Trigger', type: 'trigger', icon: Globe, desc: 'HTTP event listener' },
      ],
    },
    {
      title: 'DISCOVER & RESEARCH',
      category: 'discover',
      items: [
        { name: 'Discover Topics', type: 'discover', icon: Search, desc: 'Web & news search' },
        { name: 'RSS News Aggregator', type: 'discover', icon: Rss, desc: 'HackerNews & ArXiv feeds' },
        { name: 'Tavily Deep Search', type: 'discover', icon: FileText, desc: 'LLM web search API' },
      ],
    },
    {
      title: 'AI JUDGMENT & VOICE',
      category: 'process',
      items: [
        { name: 'AI Editorial Judge', type: 'process', icon: Scale, desc: 'Evaluate novelty & score' },
        { name: 'Persona Voice Synthesizer', type: 'process', icon: Cpu, desc: 'Generate post in voice' },
        { name: 'Add Editorial Rationale', type: 'process', icon: Sparkles, desc: 'Explain why selected' },
      ],
    },
    {
      title: 'MEMORY & AUDIT',
      category: 'memory',
      items: [
        { name: 'Update Memory', type: 'memory', icon: Database, desc: 'SQLite dedup memory' },
        { name: 'Log Rejected Topic', type: 'memory', icon: AlertCircle, desc: 'Audit rejected topics' },
      ],
    },
    {
      title: 'PUBLISH & OUTPUT',
      category: 'output',
      items: [
        { name: 'Publish Post', type: 'output', icon: Send, desc: 'Publish to feed' },
        { name: 'Webhook Output', type: 'output', icon: RefreshCw, desc: 'Send to Slack/Discord' },
      ],
    },
  ];

  const categoryColors: Record<string, { bg: string; color: string; border: string }> = {
    trigger: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.25)' },
    discover: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.25)' },
    process: { bg: 'rgba(234, 179, 8, 0.12)', color: '#eab308', border: 'rgba(234, 179, 8, 0.25)' },
    memory: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.25)' },
    output: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.25)' },
  };

  if (isCollapsed) {
    return (
      <aside style={{
        width: '56px', minWidth: '56px', background: '#0c0c0e',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex',
        flexDirection: 'column', height: '100vh', zIndex: 15, alignItems: 'center',
        transition: 'all 0.2s ease',
      }}>
        <div style={{ padding: '14px 0 10px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={() => setIsCollapsed(false)}
            title="Open Agent Tools Palette"
            style={{
              background: 'none', border: 'none', color: '#71717a', cursor: 'pointer',
              padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          {groups.map((group) =>
            group.items.map((item, i) => {
              const Icon = item.icon;
              const theme = categoryColors[item.type] || categoryColors.trigger;
              return (
                <motion.button
                  key={`${group.category}-${i}`}
                  onClick={() => onAddNode(item.name, group.category)}
                  title={`Add ${item.name} (${item.desc})`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: theme.bg, border: `1px solid ${theme.border}`,
                    color: theme.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <Icon size={14} />
                </motion.button>
              );
            })
          )}
        </div>
      </aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        width: '210px', minWidth: '210px', background: '#0c0c0e',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex',
        flexDirection: 'column', height: '100vh', zIndex: 15, transition: 'all 0.2s ease',
      }}
    >
      <div style={{ padding: '16px 14px 10px', fontSize: '13px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.01em' }}>
        <span>Agent Tools</span>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Close Agent Tools Palette"
          style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: 'rgba(20, 20, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
          <Search size={13} color="#71717a" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '11px', width: '100%', fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {groups.map((group, idx) => {
          const filtered = group.items.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.desc.toLowerCase().includes(search.toLowerCase())
          );
          if (filtered.length === 0) return null;

          return (
            <div key={idx}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '2px' }}>{group.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filtered.map((item, i) => {
                  const Icon = item.icon;
                  const theme = categoryColors[item.type] || categoryColors.trigger;
                  return (
                    <motion.div
                      key={i}
                      onClick={() => onAddNode(item.name, group.category)}
                      title={`Click to add ${item.name} (${item.desc})`}
                      whileHover={{ x: 3, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                        background: 'rgba(20, 20, 32, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: theme.bg, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color, flexShrink: 0 }}>
                        <Icon size={13} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                        <span style={{ fontSize: '9px', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.desc}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.aside>
  );
};
