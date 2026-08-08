import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SelectedNodeInfo } from './WorkflowCanvas';
import { SystemStats } from '../types';

interface NodePanelProps {
  node: SelectedNodeInfo | null;
  stats: SystemStats | null;
}

export const NodePanel: React.FC<NodePanelProps> = ({ node, stats }) => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');

  if (!node) {
    return (
      <aside className="right-panel">
        <div className="empty-state" style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-3)' }}>Select a node to view details</p>
        </div>
      </aside>
    );
  }

  const Icon = node.icon;

  return (
    <aside className="right-panel">
      {/* Header */}
      <div className="panel-header">
        <div className={`panel-icon node-icon ${node.color}`}>
          <Icon size={14} />
        </div>
        <div className="panel-title">{node.title}</div>
        <button className="panel-test-btn">Test Node</button>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`panel-tab ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Parameters
        </button>
        <button
          className={`panel-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Body */}
      <div className="panel-body">
        {activeTab === 'parameters' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {node.params.map((p, i) => (
              <div key={i} className="panel-field">
                <span className="panel-field-label">{p.label}</span>
                <div className="panel-field-value">{p.value}</div>
              </div>
            ))}

            <div className="panel-description">
              <h5>{node.description}</h5>
              <p>{node.descriptionDetail}</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div className="panel-field">
              <span className="panel-field-label">Node ID</span>
              <div className="panel-field-value" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>
                {node.id}
              </div>
            </div>

            <div className="panel-field">
              <span className="panel-field-label">Retry on Failure</span>
              <div className="panel-field-value">Enabled (3 attempts)</div>
            </div>

            <div className="panel-field">
              <span className="panel-field-label">Timeout</span>
              <div className="panel-field-value">30 seconds</div>
            </div>

            <div className="panel-description">
              <h5>Advanced Options</h5>
              <p>Rate limit backoff is enabled for Groq API calls. Retry delay follows exponential backoff with 10s base.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="panel-footer">
        <div className="output-badge">
          <span className="output-dot" />
          Output
        </div>
        <div className="panel-stat-row">
          <span className="panel-stat-label">Next execution</span>
          <span className="panel-stat-value">Auto</span>
        </div>
        <div className="panel-stat-row">
          <span className="panel-stat-label">Total posts</span>
          <span className="panel-stat-value">{stats?.postsCount ?? 0}</span>
        </div>
        <div className="panel-stat-row">
          <span className="panel-stat-label">Accept rate</span>
          <span className="panel-stat-value">{stats?.acceptanceRate ?? '0%'}</span>
        </div>
      </div>
    </aside>
  );
};
