import React, { useState } from 'react';
import {
  Search, Clock, Globe, Play, Scale, Cpu, FileText,
  Database, Send, Sparkles, AlertCircle, RefreshCw, Rss,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

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

  if (isCollapsed) {
    return (
      <aside className="add-nodes-sidebar collapsed">
        <div className="palette-header collapsed">
          <button
            className="palette-toggle-btn"
            onClick={() => setIsCollapsed(false)}
            title="Open Agent Tools Palette"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>

        <div className="palette-collapsed-icons">
          {groups.map((group) =>
            group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={`${group.category}-${i}`}
                  className={`palette-collapsed-icon-btn ${item.type}`}
                  onClick={() => onAddNode(item.name, group.category)}
                  title={`Add ${item.name} (${item.desc})`}
                >
                  <Icon size={14} />
                </button>
              );
            })
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="add-nodes-sidebar">
      <div className="palette-header">
        <span>Agent Tools</span>
        <button
          className="palette-toggle-btn"
          onClick={() => setIsCollapsed(true)}
          title="Close Agent Tools Palette"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="palette-search-box">
        <div className="search-input-wrapper">
          <Search size={13} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="palette-groups-scroll">
        {groups.map((group, idx) => {
          const filtered = group.items.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.desc.toLowerCase().includes(search.toLowerCase())
          );
          if (filtered.length === 0) return null;

          return (
            <div key={idx}>
              <div className="palette-group-title">{group.title}</div>
              <div className="palette-items-list">
                {filtered.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="palette-item-card"
                      onClick={() => onAddNode(item.name, group.category)}
                      title={`Click to add ${item.name} (${item.desc})`}
                    >
                      <div className={`palette-item-icon ${item.type}`}>
                        <Icon size={13} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span className="palette-item-name">{item.name}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
