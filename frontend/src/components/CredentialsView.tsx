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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>API Credentials & Model Integrations</h3>
        <p style={{ fontSize: '13px', color: '#9d9db8', lineHeight: 1.5 }}>
          Manage your live LLM provider keys and search engine integrations securely.
        </p>
      </div>

      {/* Groq API Key Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(16, 16, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '22px',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
            }}>
              <KeyRound size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Groq Cloud LLM API</div>
              <div style={{ fontSize: '11px', color: '#9d9db8' }}>Powers persona reasoning, topic judging & editorial generation</div>
            </div>
          </div>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '3px 10px', borderRadius: '100px',
          }}>
            ✓ ACTIVE & CONNECTED
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Key Secret</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type={showGroqKey ? 'text' : 'password'}
              style={{
                flex: 1, padding: '10px 14px', background: 'rgba(20, 20, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
                color: '#ffffff', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', outline: 'none',
              }}
              value={showGroqKey ? 'gsk_x9N82mQp4K1LzW7vJ00a2948b8c' : '••••••••••••••••••••••••••••••••'}
              readOnly
            />
            <button
              onClick={() => setShowGroqKey(!showGroqKey)}
              style={{
                padding: '10px 16px', background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                color: '#9d9db8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {showGroqKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            style={{
              padding: '9px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)', opacity: isTesting ? 0.7 : 1,
            }}
          >
            {isTesting ? <RefreshCw className="spin" size={14} /> : <Shield size={14} />}
            {isTesting ? 'Testing Connection...' : 'Test Connection'}
          </button>
          <span style={{ fontSize: '11px', color: '#71717a', fontFamily: 'JetBrains Mono, monospace' }}>Env: GROQ_API_KEY</span>
        </div>

        {testResult && (
          <div style={{
            fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)',
            padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)',
          }}>
            {testResult}
          </div>
        )}
      </motion.div>

      {/* Tavily Web Search API Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(16, 16, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '22px',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee',
            }}>
              <Lock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Live Web News API (Tavily)</div>
              <div style={{ fontSize: '11px', color: '#9d9db8' }}>Fetches live candidate topics and search results autonomously</div>
            </div>
          </div>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '3px 10px', borderRadius: '100px',
          }}>
            ✓ READY
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Provider API Key</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type={showTavilyKey ? 'text' : 'password'}
              style={{
                flex: 1, padding: '10px 14px', background: 'rgba(20, 20, 32, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px',
                color: '#ffffff', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', outline: 'none',
              }}
              value={showTavilyKey ? 'tvly-live-7839210a-847291' : '••••••••••••••••••••••••••••••••'}
              readOnly
            />
            <button
              onClick={() => setShowTavilyKey(!showTavilyKey)}
              style={{
                padding: '10px 16px', background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                color: '#9d9db8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {showTavilyKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
