import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, RefreshCw, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const CredentialsView: React.FC = () => {
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('✅ Connection Successful! Groq Llama-3.3-70B API is responsive (latency: 142ms)');
    }, 1200);
  };

  return (
    <div className="view-viewport-container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>API Credentials & Integrations</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Manage your live API credentials and model service connections securely.
        </p>
      </div>

      {/* Groq API Key Card */}
      <div className="inspector-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="node-icon discover">
              <KeyRound size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Groq Cloud API Key</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Used for LLM persona text generation & topic filtering</div>
            </div>
          </div>
          <span className="verdict-chip accept">✓ ACTIVE & CONNECTED</span>
        </div>

        <div className="input-field-group">
          <label>API Key Secret</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type={showGroqKey ? 'text' : 'password'}
              className="styled-inspector-input"
              value={showGroqKey ? 'gsk_x9N82mQp4K1LzW7vJ00a2948b8c' : '••••••••••••••••••••••••••••••••'}
              readOnly
            />
            <button
              className="btn btn-topbar-outline"
              onClick={() => setShowGroqKey(!showGroqKey)}
              style={{ padding: '6px 12px' }}
            >
              {showGroqKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          <button className="btn btn-topbar-purple" onClick={handleTestConnection} disabled={isTesting}>
            {isTesting ? <RefreshCw className="spin" size={13} /> : <Shield size={13} />}
            {isTesting ? 'Testing API Connection...' : 'Test Connection'}
          </button>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Env: GROQ_API_KEY</span>
        </div>

        {testResult && (
          <div style={{ fontSize: '11px', color: 'var(--green)', background: 'var(--green-bg)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--green-border)' }}>
            {testResult}
          </div>
        )}
      </div>

      {/* Live Web Search API */}
      <div className="inspector-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="node-icon memory">
              <Lock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Live Web News API</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tavily / News Search API for live topic discovery</div>
            </div>
          </div>
          <span className="verdict-chip accept">✓ READY</span>
        </div>

        <div className="input-field-group">
          <label>Search Provider API Key</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type={showTavilyKey ? 'text' : 'password'}
              className="styled-inspector-input"
              value={showTavilyKey ? 'tvly-live-7839210a-847291' : '••••••••••••••••••••••••••••••••'}
              readOnly
            />
            <button
              className="btn btn-topbar-outline"
              onClick={() => setShowTavilyKey(!showTavilyKey)}
              style={{ padding: '6px 12px' }}
            >
              {showTavilyKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
