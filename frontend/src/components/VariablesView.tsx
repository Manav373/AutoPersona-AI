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
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ marginBottom: '4px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>System Environment & Workflow Variables</h3>
        <p style={{ fontSize: '13px', color: '#9d9db8', lineHeight: 1.5 }}>
          Configure threshold parameters, novelty scoring minimums, and publishing cadence.
        </p>
      </div>

      {/* Variables Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(16, 16, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'rgba(20, 20, 32, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '12px 16px' }}>Variable Key</th>
              <th style={{ padding: '12px 16px' }}>Configured Value</th>
              <th style={{ padding: '12px 16px' }}>Scope</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vars.map((v) => (
              <tr key={v.key} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#818cf8' }}>
                  {v.key}
                </td>
                <td style={{ padding: '12px 16px', color: '#ffffff' }}>
                  {editingKey === v.key ? (
                    <input
                      type="text"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      style={{
                        padding: '6px 10px', background: 'rgba(20, 20, 32, 0.9)',
                        border: '1px solid #6366f1', borderRadius: '6px',
                        color: '#ffffff', fontSize: '12px', outline: 'none',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    />
                  ) : (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.value}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: '#9d9db8' }}>{v.scope}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {editingKey === v.key ? (
                    <button
                      onClick={() => handleSaveEdit(v.key)}
                      style={{
                        padding: '4px 10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none', borderRadius: '6px', color: '#ffffff', fontSize: '11px',
                        fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <Save size={12} /> Save
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setEditingKey(v.key); setEditVal(v.value); }}
                        title="Edit variable"
                        style={{
                          background: 'none', border: 'none', color: '#9d9db8', cursor: 'pointer',
                          padding: '4px', borderRadius: '4px', display: 'flex',
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.key)}
                        title="Delete variable"
                        style={{
                          background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                          padding: '4px', borderRadius: '4px', display: 'flex',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Add Variable Form Card */}
      <motion.form
        onSubmit={handleAdd}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(16, 16, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Variable Key</label>
          <input
            type="text"
            placeholder="e.g. MAX_DAILY_POSTS"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            style={{
              padding: '9px 12px', background: 'rgba(20, 20, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
              color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'JetBrains Mono, monospace',
            }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configured Value</label>
          <input
            type="text"
            placeholder="e.g. 12"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            style={{
              padding: '9px 12px', background: 'rgba(20, 20, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
              color: '#ffffff', fontSize: '12px', outline: 'none', fontFamily: 'JetBrains Mono, monospace',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px',
            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Plus size={14} /> Add Variable
        </button>
      </motion.form>
    </div>
  );
};
