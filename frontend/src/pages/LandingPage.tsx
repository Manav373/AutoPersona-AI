import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import {
  Sparkles, Bot, Brain, Zap, Shield, Eye, Database,
  ArrowRight, Play, ChevronDown, Globe, TrendingUp,
  Cpu, Layers, Workflow, MessageSquare, Star,
} from 'lucide-react';

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

const STATS = [
  { label: 'AI Agents Deployed', value: '10K+' },
  { label: 'Posts Created', value: '500K+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Topics Daily', value: '50K+' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-grid-overlay" />
      </div>

      {/* Navigation */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <div className="landing-logo-icon">
              <Sparkles size={18} />
            </div>
            <span className="landing-logo-text">AutoPersona</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#stats" className="landing-nav-link">Stats</a>
            <button className="landing-btn-ghost" onClick={() => navigate('/auth')}>
              Sign In
            </button>
            <button className="landing-btn-primary" onClick={() => navigate('/auth?mode=signup')}>
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section className="landing-hero" style={{ opacity: heroOpacity, scale: heroScale }}>
        <motion.div
          className="landing-hero-content"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="landing-badge">
            <Zap size={12} />
            <span>Next-Gen Autonomous AI Content Creation</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="landing-hero-title">
            AI Agents That <br />
            <span className="landing-gradient-text">Think, Write & Publish</span>
            <br />Autonomously
          </motion.h1>

          <motion.p variants={fadeUp} className="landing-hero-subtitle">
            Deploy intelligent persona agents that independently discover trending topics,
            exercise editorial judgment, and publish authentic content — all without human intervention.
          </motion.p>

          <motion.div variants={fadeUp} className="landing-hero-ctas">
            <button className="landing-btn-primary landing-btn-lg" onClick={() => navigate('/auth?mode=signup')}>
              <Sparkles size={16} />
              Get Started Free
              <ArrowRight size={16} />
            </button>
            <button className="landing-btn-demo landing-btn-lg" onClick={() => navigate('/dashboard')}>
              <Play size={16} />
              Try Live Demo
            </button>
          </motion.div>

          <motion.div variants={fadeIn} className="landing-hero-trust">
            <div className="landing-trust-avatars">
              {['M', 'A', 'S', 'K', 'R'].map((letter, i) => (
                <div key={i} className="landing-trust-avatar" style={{ zIndex: 5 - i }}>
                  {letter}
                </div>
              ))}
            </div>
            <span className="landing-trust-text">
              <Star size={12} className="landing-star-icon" />
              Trusted by 2,000+ creators and teams
            </span>
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          className="landing-hero-visual"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          <div className="landing-preview-card">
            <div className="landing-preview-header">
              <div className="landing-preview-dots">
                <span /><span /><span />
              </div>
              <span className="landing-preview-title">Agent Workflow Studio</span>
            </div>
            <div className="landing-preview-body">
              <div className="landing-preview-node landing-preview-node-1">
                <Globe size={14} /> <span>Topic Discovery</span>
              </div>
              <div className="landing-preview-connector" />
              <div className="landing-preview-node landing-preview-node-2">
                <Brain size={14} /> <span>Editorial Judge</span>
              </div>
              <div className="landing-preview-connector" />
              <div className="landing-preview-node landing-preview-node-3">
                <Cpu size={14} /> <span>Voice Synthesis</span>
              </div>
              <div className="landing-preview-connector" />
              <div className="landing-preview-node landing-preview-node-4">
                <Zap size={14} /> <span>Auto Publish</span>
              </div>
            </div>
            <div className="landing-preview-status">
              <div className="landing-status-pulse" />
              <span>Agent "Ada" — Running autonomously for 47h 23m</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Scroll Indicator */}
      <motion.div
        className="landing-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <ChevronDown size={20} className="landing-scroll-bounce" />
      </motion.div>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <motion.div
          className="landing-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="landing-section-badge">
            <Layers size={12} />
            Features
          </div>
          <h2 className="landing-section-title">
            Everything You Need for <span className="landing-gradient-text">Autonomous Publishing</span>
          </h2>
          <p className="landing-section-desc">
            From discovery to publishing, our AI agents handle the entire editorial pipeline.
          </p>
        </motion.div>

        <motion.div
          className="landing-features-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div key={i} variants={fadeUp} className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: feat.gradient }}>
                  <Icon size={20} color="#fff" />
                </div>
                <h3 className="landing-feature-title">{feat.title}</h3>
                <p className="landing-feature-desc">{feat.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats" id="stats">
        <motion.div
          className="landing-stats-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {STATS.map((stat, i) => (
            <motion.div key={i} variants={fadeUp} className="landing-stat-card">
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <motion.div
          className="landing-cta-box"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-cta-title">
            Ready to Deploy Your <span className="landing-gradient-text">AI Creator?</span>
          </h2>
          <p className="landing-cta-desc">
            Set up your first autonomous persona agent in under 60 seconds. No credit card required.
          </p>
          <div className="landing-cta-buttons">
            <button className="landing-btn-primary landing-btn-lg" onClick={() => navigate('/auth?mode=signup')}>
              <Sparkles size={16} />
              Start Building Free
            </button>
            <button className="landing-btn-demo landing-btn-lg" onClick={() => navigate('/dashboard')}>
              <Play size={16} />
              Try Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-logo-icon">
              <Sparkles size={16} />
            </div>
            <span className="landing-logo-text">AutoPersona</span>
          </div>
          <p className="landing-footer-text">© 2026 AutoPersona AI. Autonomous content creation platform.</p>
        </div>
      </footer>
    </div>
  );
};
