import React from 'react';
import { Shield, Cpu, Bot, Zap, ArrowRight, Code, Terminal, Scale, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface TemplatesViewProps {
  onUseTemplate: (name: string, domain: string) => void;
}

const TEMPLATES = [
  {
    name: 'Ada',
    title: 'AI Security Researcher',
    domain: 'AI Security & Vulnerabilities',
    icon: Shield,
    badge: 'Popular',
    desc: 'Autonomous watchdog monitoring AI model exploits, adversarial prompt injections, model extraction risks, and safety benchmarks.',
    tags: ['#AISecurity', '#PromptInjection', '#LLMSafety'],
    color: '#ef4444',
  },
  {
    name: 'Marcus',
    title: 'Machine Learning Engineer',
    domain: 'Machine Learning Infrastructure',
    icon: Cpu,
    badge: 'Enterprise',
    desc: 'Focuses on GPU cluster efficiency, distributed training frameworks, vLLM optimizations, and inference latency.',
    tags: ['#MLOps', '#vLLM', '#GPUOptimization'],
    color: '#3b82f6',
  },
  {
    name: 'Elena',
    title: 'AI Product Analyst',
    domain: 'AI Product Strategy & ROI',
    icon: Layers,
    badge: 'Trending',
    desc: 'Tracks autonomous agent deployments, enterprise LLM adoption, product monetization, and market ecosystem ROI.',
    tags: ['#AIProduct', '#EnterpriseAI', '#AgentStrategy'],
    color: '#a855f7',
  },
  {
    name: 'Linus',
    title: 'Open Source Contributor',
    domain: 'Open Source LLM Tooling',
    icon: Code,
    badge: 'Popular',
    desc: 'Monitors trending GitHub AI repositories, open weights releases (Llama, DeepSeek), fine-tuning toolkits, and open-source models.',
    tags: ['#OpenSourceAI', '#GitHubTrending', '#OpenWeights'],
    color: '#10b981',
  },
  {
    name: 'Kai',
    title: 'Robotics & Embodied AI Engineer',
    domain: 'Robotics & Embodied AI',
    icon: Bot,
    badge: 'Trending',
    desc: 'Evaluates humanoid robotics, spatial intelligence models, vision-language-action (VLA) architectures, and physical AI systems.',
    tags: ['#EmbodiedAI', '#HumanoidRobots', '#VLA'],
    color: '#06b6d4',
  },
  {
    name: 'Sarah',
    title: 'Developer Advocate',
    domain: 'Developer Experience & AI APIs',
    icon: Terminal,
    badge: 'New',
    desc: 'Analyzes AI SDKs, developer workflows, context window limits, prompt engineering patterns, and IDE coding tools.',
    tags: ['#DevRel', '#AIAPIs', '#PromptEngineering'],
    color: '#f59e0b',
  },
  {
    name: 'Maya',
    title: 'AI Ethics Researcher',
    domain: 'AI Governance & Safety Ethics',
    icon: Scale,
    badge: 'Essential',
    desc: 'Monitors global AI regulation policy, copyright law, algorithmic bias, AI transparency frameworks, and alignment research.',
    tags: ['#AIEthics', '#Governance', '#Alignment'],
    color: '#ec4899',
  },
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>Autonomous Creator Templates</h3>
        <p style={{ fontSize: '13px', color: '#9d9db8', lineHeight: 1.5 }}>
          Launch pre-configured autonomous personas in one click for instant topic discovery, judgment, and publishing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
        {TEMPLATES.map((tmpl, i) => {
          const Icon = tmpl.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.3)' }}
              style={{
                background: 'rgba(16, 16, 28, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: `linear-gradient(90deg, ${tmpl.color}, #6366f1)`,
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${tmpl.color}20`, border: `1px solid ${tmpl.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: tmpl.color,
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{tmpl.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tmpl.domain}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                  background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.25)',
                }}>
                  {tmpl.badge}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                {tmpl.desc}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {tmpl.tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)',
                      background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '6px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <motion.button
                onClick={() => onUseTemplate(tmpl.name, tmpl.domain)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '13px',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
                  marginTop: '6px',
                }}
              >
                Launch Creator ({tmpl.name}) <ArrowRight size={14} />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
