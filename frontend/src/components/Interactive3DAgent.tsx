import React, { useState, useEffect, useRef } from 'react';
import { Bot, Brain, Cpu, Zap, Shield, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Interactive3DAgentProps {
  theme?: 'dark' | 'light';
}

const AGENT_ACTIONS = [
  '🌐 Crawling Tavily Live Search Index',
  '🧠 LLM Evaluating Topic Novelty & Relevance (94%)',
  '🎙️ Synthesizing Persona Voice Rationale',
  '💾 Deduplicating Topic Key in Vector Memory',
  '⚡ Executing Autonomous Publication Trigger',
];

export const Interactive3DAgent: React.FC<Interactive3DAgentProps> = ({ theme = 'dark' }) => {
  const [actionIdx, setActionIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Cycle agent status actions every 2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActionIdx((prev) => (prev + 1) % AGENT_ACTIONS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // 3D Perspective Tilt on Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 30, y: -y * 30 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
      }}
    >
      <motion.div
        animate={{
          rotateY: mousePos.x,
          rotateX: mousePos.y,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
          background: theme === 'light' ? '#ffffff' : 'rgba(16, 16, 28, 0.95)',
          border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: theme === 'light'
            ? '0 20px 60px rgba(0, 0, 0, 0.08)'
            : '0 24px 80px rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#ffffff',
            }}>
              <Bot size={16} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
              Autonomous 3D Agent Core
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px',
            fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)',
            padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <Activity size={12} className="spin" /> 60 FPS Interactive
          </div>
        </div>

        {/* 3D Spatial Canvas Stage — always dark for contrast */}
        <div style={{
          position: 'relative', width: '100%', height: '260px', borderRadius: '16px',
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.3) 0%, #07070e 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          border: theme === 'light' ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: theme === 'light' ? '0 0 0 1px rgba(99,102,241,0.15)' : 'none',
        }}>
          {/* Orbital Glowing Rings */}
          <div className="spin-slow" style={{
            position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
            border: '2px dashed rgba(99, 102, 241, 0.4)', pointerEvents: 'none',
          }} />
          <div className="spin" style={{
            position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
            border: '1px dotted rgba(6, 182, 212, 0.3)', animationDuration: '20s', pointerEvents: 'none',
          }} />

          {/* Central 3D Bot Core */}
          <motion.div
            animate={{ y: [-8, 8, -8], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 50px rgba(99, 102, 241, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', zIndex: 10, cursor: 'pointer',
            }}
          >
            <Bot size={52} color="#ffffff" />
          </motion.div>

          {/* Orbiting Satellite Nodes */}
          {[
            { icon: Brain, label: 'Judge', color: '#38bdf8', top: '18%', left: '18%' },
            { icon: Zap, label: 'Publish', color: '#22c55e', top: '18%', right: '18%' },
            { icon: Shield, label: 'Memory', color: '#f59e0b', bottom: '18%', left: '18%' },
            { icon: Cpu, label: 'Voice', color: '#c084fc', bottom: '18%', right: '18%' },
          ].map((satellite, idx) => {
            const Icon = satellite.icon;
            return (
              <motion.div
                key={idx}
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.4 }}
                style={{
                  position: 'absolute', top: satellite.top, bottom: satellite.bottom,
                  left: satellite.left, right: satellite.right,
                  background: 'rgba(12, 12, 22, 0.92)',
                  border: `1.5px solid ${satellite.color}80`, borderRadius: '10px',
                  padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: `0 0 16px ${satellite.color}50, 0 4px 14px rgba(0,0,0,0.5)`,
                  zIndex: 12,
                }}
              >
                <Icon size={13} color={satellite.color} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.03em' }}>
                  {satellite.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Live Autonomous Activity Ticker */}
        <div style={{
          background: theme === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.1)',
          border: theme === 'light' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Sparkles size={16} color="#818cf8" className="spin" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
            {AGENT_ACTIONS[actionIdx]}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
