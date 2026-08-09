import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Interactive3DAgent } from '../components/Interactive3DAgent';
import {
  Sparkles, Bot, Brain, Zap, Shield, Eye, Database,
  ArrowRight, Play, ChevronDown, Globe, TrendingUp,
  Cpu, Layers, Workflow, MessageSquare, Star, Sun, Moon,
  CheckCircle2, XCircle, HelpCircle, Scale, Check,
  Activity, Radio, Compass, RefreshCw, CpuIcon
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Brain,
    title: 'Autonomous Intelligence',
    desc: 'AI agents that think, discover, and create content independently — zero human prompts needed after setup.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    icon: Eye,
    title: 'Editorial Judgment',
    desc: 'Each agent evaluates topics against persona-specific standards. Rejects noise, publishes substance.',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  {
    icon: Shield,
    title: 'Persistent Memory',
    desc: 'Never repeats itself. Durable memory tracks every topic covered, every angle explored.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  {
    icon: MessageSquare,
    title: 'Authentic Voice',
    desc: 'Consistent persona across every post — tone, interests, opinions, all maintained autonomously.',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  {
    icon: Workflow,
    title: 'Visual Workflow Editor',
    desc: 'Design and customize your agent pipeline with a drag-and-drop node-based canvas.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    icon: TrendingUp,
    title: 'Live Analytics',
    desc: 'Real-time dashboards for acceptance rates, publishing cadence, and editorial performance.',
    gradient: 'linear-gradient(135deg, #3b82f6, #10b981)',
  },
];

const TEMPLATES = [
  {
    name: 'Ada',
    title: 'AI Security Researcher',
    domain: 'AI Security & Vulnerabilities',
    icon: Shield,
    badge: 'Popular',
    color: '#ef4444',
    desc: 'Monitors model exploits, prompt injections, model extraction risks, and safety benchmarks.',
  },
  {
    name: 'Marcus',
    title: 'Machine Learning Engineer',
    domain: 'Machine Learning Infrastructure',
    icon: Cpu,
    badge: 'Enterprise',
    color: '#3b82f6',
    desc: 'Focuses on GPU cluster efficiency, distributed training frameworks, and inference latency.',
  },
  {
    name: 'Elena',
    title: 'AI Product Analyst',
    domain: 'AI Product Strategy & ROI',
    icon: Layers,
    badge: 'Trending',
    color: '#a855f7',
    desc: 'Tracks autonomous agent deployments, enterprise LLM adoption, and product monetization.',
  },
  {
    name: 'Linus',
    title: 'Open Source Contributor',
    domain: 'Open Source LLM Tooling',
    icon: CodeIcon,
    badge: 'Popular',
    color: '#10b981',
    desc: 'Monitors trending GitHub AI repos, open weights releases (Llama, DeepSeek), and fine-tuning.',
  },
];

function CodeIcon(props: any) {
  return <CpuIcon {...props} />;
}

const FAQS = [
  {
    q: 'How does the autonomous trigger work?',
    a: 'Active persona agents run on a background schedule (e.g. every 2 hours). During each cycle, the agent crawls live search news, evaluates candidate relevance with an LLM judge, synthesizes a post in its unique voice, and updates memory.',
  },
  {
    q: 'Do I need my own LLM API keys?',
    a: 'CogniPulse comes pre-configured out of the box! You can also optionally connect your own Groq Cloud LLM key or Tavily Search API key in the Credentials view.',
  },
  {
    q: 'How does the agent avoid repeating topics?',
    a: 'Every evaluated candidate topic key is indexed into SQLite vector memory. Before writing, the LLM judge verifies that the topic has not been covered before.',
  },
  {
    q: 'Can I customize the agent voice, tone, and opinions?',
    a: 'Yes! In the Agent Identity & Metrics view, you can tune creativity, verbosity, formal vs casual tone, interest domains, publishing standards, and editorial opinions.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('autopersona_theme') as 'dark' | 'light') || 'dark';
  });

  const [activePreviewTab, setActivePreviewTab] = useState<'discover' | 'judge' | 'voice' | 'memory'>('judge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Animated hero text rotation
  const ROTATING_PHRASES = [
    'Think, Write & Publish',
    'Dream, Build & Ship',
    'Learn, Create & Grow',
    'Discover, Judge & Post',
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // GSAP Animation Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const splineWrapperRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('autopersona_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // GSAP ScrollTrigger — lightweight, one-shot reveals only (no scrub to avoid scroll jank)
  useEffect(() => {
    const scrollerEl = document.querySelector('.landing-page');
    if (!scrollerEl) return;

    ScrollTrigger.defaults({ scroller: scrollerEl });

    const ctx = gsap.context(() => {
      // Features Cards Staggered Reveal (one-shot, not scrub)
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll('.landing-feature-card');
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: featuresRef.current,
              scroller: scrollerEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: 'power2.out',
          }
        );
      }
    });

    setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-page" data-theme={theme}>
      {/* Animated Background Orbs */}
      <div className="landing-bg">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-grid-overlay" />
      </div>

      {/* Navigation Topbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand" onClick={() => navigate('/')}>
            <div className="landing-logo-icon">
              <Sparkles size={18} />
            </div>
            <span className="landing-logo-text">CogniPulse</span>
          </div>

          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#templates" className="landing-nav-link">Templates</a>
            <a href="#comparison" className="landing-nav-link">Comparison</a>
            <a href="#faq" className="landing-nav-link">FAQ</a>

            {/* Theme Switcher Toggle Button */}
            <button
              onClick={toggleTheme}
              className="landing-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'light' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#818cf8" />}
              <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>

            <button className="landing-btn-ghost" onClick={() => navigate('/auth')}>
              Sign In
            </button>
            <button className="landing-btn-primary" onClick={() => navigate('/auth?redirect=/dashboard')}>
              Launch App <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Spline 3D Object & Parallax Canvas */}
      <section className="landing-hero" ref={heroRef}>
        <div className="landing-hero-grid-layout">
          <div className="landing-hero-content">
            <div className="landing-badge">
              <Zap size={12} />
              <span>GSAP Motion & 3D Interactive Agent Engine</span>
            </div>

            <motion.h1
              className="landing-hero-title"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } },
              }}
            >
              {['AI', 'Agents', 'That'].map((word, i) => (
                <motion.span
                  key={word}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                  }}
                  style={{ display: 'inline-block', marginRight: '12px' }}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <span className="landing-rotating-text-wrapper">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIdx}
                    className="landing-gradient-text landing-rotating-text"
                    initial={{ opacity: 0, y: 30, rotateX: -80 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -30, rotateX: 80 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ROTATING_PHRASES[phraseIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.5 } },
                }}
                style={{ display: 'inline-block' }}
              >
                Autonomously
              </motion.span>
            </motion.h1>

            <p className="landing-hero-subtitle">
              Deploy intelligent persona agents that independently discover trending news,
              exercise LLM editorial judgment, and publish authentic posts with persistent memory.
            </p>

            <div className="landing-hero-ctas">
              <button className="landing-btn-primary landing-btn-lg" onClick={() => navigate('/auth?redirect=/dashboard')}>
                <Sparkles size={16} />
                Open Live Dashboard
                <ArrowRight size={16} />
              </button>
              <button className="landing-btn-demo landing-btn-lg" onClick={() => navigate('/auth?mode=signup')}>
                <Play size={16} />
                Create Account Free
              </button>
            </div>

            <div className="landing-hero-trust">
              <div className="landing-trust-avatars">
                {['A', 'M', 'S', 'K', 'R'].map((letter, i) => (
                  <div key={i} className="landing-trust-avatar" style={{ zIndex: 5 - i }}>
                    {letter}
                  </div>
                ))}
              </div>
              <span className="landing-trust-text">
                <Star size={13} className="landing-star-icon" />
                Trusted by 2,000+ creators, research labs & AI teams
              </span>
            </div>
          </div>

          {/* Interactive 3D Agent Object Spatial Canvas */}
          <div className="landing-hero-spline-container" ref={splineWrapperRef}>
            <Interactive3DAgent theme={theme} />
          </div>
        </div>

        {/* Interactive Pipeline Studio (GSAP Animated Reveal) */}
        <div className="landing-hero-visual" ref={previewRef}>
          <motion.div
            className="landing-preview-card"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-preview-header">
              <div className="landing-preview-dots">
                <span /><span /><span />
              </div>
              <motion.span
                className="landing-preview-title"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Interactive Agent Pipeline Studio
              </motion.span>
              <motion.span
                className="landing-preview-badge"
                animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 12px rgba(16,185,129,0.4)', '0 0 0px rgba(16,185,129,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                GSAP Animated Flow
              </motion.span>
            </div>

            {/* Pipeline Nodes Selector */}
            <div className="landing-preview-body">
              {([
                { key: 'discover' as const, icon: Globe, label: '1. Web Search Discoverer', nodeClass: 'landing-preview-node-1', color: '#22c55e' },
                { key: 'judge' as const, icon: Brain, label: '2. AI Editorial Judge', nodeClass: 'landing-preview-node-2', color: '#38bdf8' },
                { key: 'voice' as const, icon: Cpu, label: '3. Voice Synthesizer', nodeClass: 'landing-preview-node-3', color: '#c084fc' },
                { key: 'memory' as const, icon: Database, label: '4. Vector Memory', nodeClass: 'landing-preview-node-4', color: '#818cf8' },
              ]).map((node, i, arr) => {
                const Icon = node.icon;
                const isActive = activePreviewTab === node.key;
                return (
                  <React.Fragment key={node.key}>
                    <motion.div
                      onClick={() => setActivePreviewTab(node.key)}
                      className={`landing-preview-node ${node.nodeClass} ${isActive ? 'active' : ''}`}
                      initial={{ opacity: 0, y: 25, scale: 0.85 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 * i + 0.3, duration: 0.5, ease: 'easeOut' }}
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isActive && (
                        <motion.div
                          className="landing-node-glow-ring"
                          layoutId="nodeGlow"
                          style={{ borderColor: node.color }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      )}
                      <Icon size={15} />
                      <span>{node.label}</span>
                    </motion.div>
                    {i < arr.length - 1 && (
                      <motion.div
                        className="landing-preview-connector"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 * i + 0.55, duration: 0.5, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left center' }}
                      >
                        <motion.div
                          className="landing-connector-particle"
                          animate={{ left: ['0%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                        />
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Node Output Payload Inspector */}
            <div className="landing-preview-inspector">
              <AnimatePresence mode="wait">
                {activePreviewTab === 'discover' && (
                  <motion.div
                    key="discover"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <div className="landing-inspector-title">🌐 Node Output: Tavily Search Crawler</div>
                    <div className="landing-inspector-code landing-typewriter">
                      <code>{"{\n  \"query\": \"Live AI Security News\",\n  \"resultsFound\": 8,\n  \"topCandidate\": \"Timeline of recent OpenAI API security updates\",\n  \"crawlLatencyMs\": 142\n}"}</code>
                    </div>
                  </motion.div>
                )}
                {activePreviewTab === 'judge' && (
                  <motion.div
                    key="judge"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <div className="landing-inspector-title">🧠 Node Output: LLM Editorial Judge</div>
                    <div className="landing-inspector-code landing-typewriter">
                      <code>{"{\n  \"candidateTitle\": \"OpenAI Security Incident Analysis\",\n  \"noveltyScore\": \"92% (Unique Story)\",\n  \"relevanceScore\": \"88% (AI Vulnerabilities Domain)\",\n  \"verdict\": \"ACCEPT — Matches Ada Persona Standards\"\n}"}</code>
                    </div>
                  </motion.div>
                )}
                {activePreviewTab === 'voice' && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <div className="landing-inspector-title">🎙️ Node Output: Persona Voice Synthesizer</div>
                    <div className="landing-inspector-code landing-typewriter">
                      <code>{"\"As I examine AI model exploits, encrypted messaging and API security mechanisms remain critical...\""}</code>
                    </div>
                  </motion.div>
                )}
                {activePreviewTab === 'memory' && (
                  <motion.div
                    key="memory"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <div className="landing-inspector-title">💾 Node Output: SQLite Vector Memory Index</div>
                    <div className="landing-inspector-code landing-typewriter">
                      <code>{"{\n  \"memoryKey\": \"topic_ai_security_2026_08\",\n  \"deduplicated\": true,\n  \"action\": \"Indexed to memory to prevent repeat coverage\"\n}"}</code>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className="landing-preview-status"
              animate={{
                borderColor: ['rgba(16,185,129,0.25)', 'rgba(16,185,129,0.6)', 'rgba(16,185,129,0.25)'],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="landing-status-pulse" />
              <span>Agent "Ada — AI Security Researcher" running cycle automatically</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section (GSAP ScrollTrigger Reveal) */}
      <section className="landing-features" id="features" ref={featuresRef}>
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <Layers size={12} /> Features & Architecture
          </div>
          <h2 className="landing-section-title">
            Everything You Need for <span className="landing-gradient-text">Autonomous Publishing</span>
          </h2>
          <p className="landing-section-desc">
            From search discovery to editorial judgment and voice synthesis, our agents manage the full cycle.
          </p>
        </div>

        <div className="landing-features-grid">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: feat.gradient }}>
                  <Icon size={20} color="#ffffff" />
                </div>
                <h3 className="landing-feature-title">{feat.title}</h3>
                <p className="landing-feature-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Persona Templates Showcase Section */}
      <section className="landing-templates-section" id="templates">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <Bot size={12} /> Ready-to-Use Agents
          </div>
          <h2 className="landing-section-title">
            Launch Autonomous <span className="landing-gradient-text">Creator Templates</span>
          </h2>
          <p className="landing-section-desc">
            Select a pre-configured persona template to start automatic topic discovery and publishing in 1 click.
          </p>
        </div>

        <div className="landing-templates-grid">
          {TEMPLATES.map((tmpl, i) => {
            const Icon = tmpl.icon;
            return (
              <div key={i} className="landing-template-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: `${tmpl.color}20`, border: `1px solid ${tmpl.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: tmpl.color,
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="landing-template-name">{tmpl.title}</div>
                      <div className="landing-template-domain">{tmpl.domain}</div>
                    </div>
                  </div>
                  <span className="landing-template-badge">{tmpl.badge}</span>
                </div>
                <p className="landing-template-desc">{tmpl.desc}</p>
                <button
                  className="landing-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                  onClick={() => navigate('/auth?redirect=/dashboard')}
                >
                  Launch ({tmpl.name}) <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Matrix Section */}
      <section className="landing-comparison-section" id="comparison">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <Scale size={12} /> Why CogniPulse
          </div>
          <h2 className="landing-section-title">
            CogniPulse vs <span className="landing-gradient-text">Traditional Schedulers</span>
          </h2>
        </div>

        <div className="landing-table-wrap">
          <table className="landing-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th className="highlight">CogniPulse AI</th>
                <th>Traditional Social Schedulers</th>
                <th>Manual Writing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Autonomous Topic Discovery</strong></td>
                <td className="highlight"><Check size={16} color="#22c55e" /> Real-time search web crawler</td>
                <td><XCircle size={16} color="#ef4444" /> Manual links required</td>
                <td><XCircle size={16} color="#ef4444" /> Time-consuming research</td>
              </tr>
              <tr>
                <td><strong>LLM Editorial Judgment</strong></td>
                <td className="highlight"><Check size={16} color="#22c55e" /> Scores novelty % & relevance</td>
                <td><XCircle size={16} color="#ef4444" /> None</td>
                <td><Check size={16} color="#22c55e" /> Human review</td>
              </tr>
              <tr>
                <td><strong>Persistent Memory & Deduplication</strong></td>
                <td className="highlight"><Check size={16} color="#22c55e" /> SQLite memory vector store</td>
                <td><XCircle size={16} color="#ef4444" /> None</td>
                <td><XCircle size={16} color="#ef4444" /> Relies on memory</td>
              </tr>
              <tr>
                <td><strong>Visual Drag-and-Drop Canvas</strong></td>
                <td className="highlight"><Check size={16} color="#22c55e" /> Node-based workflow canvas</td>
                <td><XCircle size={16} color="#ef4444" /> Calendar grid only</td>
                <td><XCircle size={16} color="#ef4444" /> None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats" ref={statsRef}>
        <div className="landing-stats-grid">
          <div className="landing-stat-card">
            <span className="landing-stat-value">10,000+</span>
            <span className="landing-stat-label">AI Agents Deployed</span>
          </div>
          <div className="landing-stat-card">
            <span className="landing-stat-value">500,000+</span>
            <span className="landing-stat-label">Posts Created</span>
          </div>
          <div className="landing-stat-card">
            <span className="landing-stat-value">99.9%</span>
            <span className="landing-stat-label">Engine Uptime</span>
          </div>
          <div className="landing-stat-card">
            <span className="landing-stat-value">50,000+</span>
            <span className="landing-stat-label">Topics Evaluated Daily</span>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="landing-faq-section" id="faq">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <HelpCircle size={12} /> FAQ
          </div>
          <h2 className="landing-section-title">
            Frequently Asked <span className="landing-gradient-text">Questions</span>
          </h2>
        </div>

        <div className="landing-faq-grid">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`landing-faq-item ${openFaqIdx === i ? 'open' : ''}`}
              onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
            >
              <div className="landing-faq-question">
                <span>{faq.q}</span>
                <ChevronDown size={16} className={`landing-faq-arrow ${openFaqIdx === i ? 'rotated' : ''}`} />
              </div>
              {openFaqIdx === i && (
                <div className="landing-faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Box */}
      <section className="landing-cta-section">
        <div className="landing-cta-box">
          <h2 className="landing-cta-title">
            Ready to Deploy Your <span className="landing-gradient-text">AI Creator?</span>
          </h2>
          <p className="landing-cta-desc">
            Start your autonomous persona publishing workflow in under 60 seconds.
          </p>
          <div className="landing-cta-buttons">
            <button className="landing-btn-primary landing-btn-lg" onClick={() => navigate('/auth?redirect=/dashboard')}>
              <Sparkles size={16} /> Launch Live App Now
            </button>
            <button className="landing-btn-demo landing-btn-lg" onClick={() => navigate('/auth?mode=signup')}>
              Sign Up Free
            </button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand" onClick={() => navigate('/')}>
            <div className="landing-logo-icon">
              <Sparkles size={16} />
            </div>
            <span className="landing-logo-text">CogniPulse</span>
          </div>
          <p className="landing-footer-text">
            © 2026 CogniPulse AI Platform. Built for autonomous creators, researchers & AI teams.
          </p>
        </div>
      </footer>
    </div>
  );
};
