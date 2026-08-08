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
    nameField: 'Elena',
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
    <div className="view-viewport-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Autonomous Creator Templates</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Launch pre-configured autonomous personas for instant topic discovery, editorial evaluation, and continuous publishing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {TEMPLATES.map((tmpl, i) => {
          const Icon = tmpl.icon;
          return (
            <motion.div
              key={i}
              className="inspector-info-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    className="node-box-icon"
                    style={{ background: `${tmpl.color}20`, color: tmpl.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{tmpl.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tmpl.domain}</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--purple-light)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {tmpl.badge}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {tmpl.desc}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {tmpl.tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-input)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <button
                className="btn btn-accent"
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                onClick={() => onUseTemplate(tmpl.name, tmpl.domain)}
              >
                Launch Creator ({tmpl.name}) <ArrowRight size={13} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

