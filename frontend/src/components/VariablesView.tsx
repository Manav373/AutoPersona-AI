import React, { useState } from 'react';
import { Variable, Plus, Trash2, Edit2, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VariableItem {
  key: string;
  value: string;
  type: string;
  scope: string;
}

export const VariablesView: React.FC = () => {
  const [vars, setVars] = useState<VariableItem[]>([
    { key: 'NOVELTY_SCORE_THRESHOLD', value: '0.75', type: 'number', scope: 'Global' },
    { key: 'RELEVANCE_SCORE_THRESHOLD', value: '0.65', type: 'number', scope: 'Global' },
    { key: 'CYCLE_INTERVAL_MIN_SEC', value: '90', type: 'number', scope: 'Scheduler' },
    { key: 'CYCLE_INTERVAL_MAX_SEC', value: '240', type: 'number', scope: 'Scheduler' },
    { key: 'GROQ_MODEL', value: 'llama-3.3-70b-versatile', type: 'string', scope: 'LLM Service' },
    { key: 'DEDUP_MEMORY_WINDOW', value: '30 Days', type: 'string', scope: 'SQLite' },
  ]);

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setVars([...vars, { key: newKey.trim().toUpperCase(), value: newValue.trim(), type: 'string', scope: 'Custom' }]);
    setNewKey('');
    setNewValue('');
  };

  const handleDelete = (key: string) => {
    setVars(vars.filter((v) => v.key !== key));
  };

  const handleSaveEdit = (key: string) => {
    setVars(vars.map((v) => (v.key === key ? { ...v, value: editVal } : v)));
    setEditingKey(null);
  };

  return (
    <div className="view-viewport-container" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Environment & Workflow Variables</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Configure system parameters, novelty thresholds, and autonomous publishing rules.
        </p>
      </div>

      {/* Variables List */}
      <div className="inspector-info-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 14px' }}>Variable Key</th>
              <th style={{ padding: '10px 14px' }}>Value</th>
              <th style={{ padding: '10px 14px' }}>Scope</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vars.map((v) => (
              <tr key={v.key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--purple)' }}>
                  {v.key}
                </td>
                <td style={{ padding: '10px 14px', color: '#fff' }}>
                  {editingKey === v.key ? (
                    <input
                      type="text"
                      className="styled-inspector-input"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      style={{ padding: '4px 8px' }}
                    />
                  ) : (
                    v.value
                  )}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{v.scope}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  {editingKey === v.key ? (
                    <button className="btn btn-topbar-purple" style={{ padding: '3px 8px', fontSize: '10px' }} onClick={() => handleSaveEdit(v.key)}>
                      <Save size={11} /> Save
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        className="nav-icon-btn"
                        onClick={() => { setEditingKey(v.key); setEditVal(v.value); }}
                        title="Edit variable"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="nav-icon-btn"
                        onClick={() => handleDelete(v.key)}
                        title="Delete variable"
                      >
                        <Trash2 size={12} color="var(--red)" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Variable Form */}
      <form onSubmit={handleAdd} className="inspector-info-card" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', padding: '14px' }}>
        <div className="input-field-group" style={{ flex: 1 }}>
          <label>New Variable Key</label>
          <input
            type="text"
            className="styled-inspector-input"
            placeholder="e.g. MAX_DAILY_POSTS"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
        </div>
        <div className="input-field-group" style={{ flex: 1 }}>
          <label>Value</label>
          <input
            type="text"
            className="styled-inspector-input"
            placeholder="e.g. 12"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-topbar-purple" style={{ padding: '8px 14px' }}>
          <Plus size={14} /> Add Variable
        </button>
      </form>
    </div>
  );
};
