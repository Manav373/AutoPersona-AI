import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Eye, EyeOff, ArrowRight, Play, Mail,
  Lock, User, Brain, Zap, Globe, Shield, ChevronLeft,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate auth
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1200);
  };

  const handleDemo = () => {
    navigate('/dashboard');
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      <div className="auth-container">
        {/* Left Side — Branding */}
        <motion.div
          className="auth-brand-side"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            <ChevronLeft size={16} /> Back
          </button>

          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              <div className="landing-logo-icon landing-logo-icon-lg">
                <Sparkles size={28} />
              </div>
              <h1 className="auth-brand-title">AutoPersona</h1>
            </div>

            <p className="auth-brand-tagline">
              Deploy AI agents that autonomously discover, evaluate, and publish
              content with a consistent voice.
            </p>

            <div className="auth-brand-features">
              {[
                { icon: Brain, text: 'Autonomous editorial judgment' },
                { icon: Globe, text: 'Real-time topic discovery' },
                { icon: Shield, text: 'Persistent memory & deduplication' },
                { icon: Zap, text: 'Zero-intervention publishing' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    className="auth-brand-feature"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="auth-feature-icon">
                      <Icon size={14} />
                    </div>
                    <span>{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Decorative floating nodes */}
          <div className="auth-floating-nodes">
            <div className="auth-float-node auth-float-1">
              <Brain size={16} />
            </div>
            <div className="auth-float-node auth-float-2">
              <Globe size={14} />
            </div>
            <div className="auth-float-node auth-float-3">
              <Zap size={14} />
            </div>
          </div>
        </motion.div>

        {/* Right Side — Form */}
        <motion.div
          className="auth-form-side"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="auth-form-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-form-header">
                  <h2 className="auth-form-title">
                    {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="auth-form-subtitle">
                    {mode === 'signin'
                      ? 'Sign in to manage your autonomous AI agents'
                      : 'Start deploying AI persona agents in seconds'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  {mode === 'signup' && (
                    <div className="auth-field">
                      <label className="auth-label">
                        <User size={14} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="auth-field">
                    <label className="auth-label">
                      <Mail size={14} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">
                      <Lock size={14} />
                      Password
                    </label>
                    <div className="auth-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="auth-spinner" />
                        {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <button className="auth-demo-btn" onClick={handleDemo}>
                  <Play size={16} />
                  Try Demo — Skip Sign In
                </button>

                <div className="auth-toggle-text">
                  {mode === 'signin' ? (
                    <p>
                      Don't have an account?{' '}
                      <button className="auth-toggle-btn" onClick={toggleMode}>
                        Create one
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{' '}
                      <button className="auth-toggle-btn" onClick={toggleMode}>
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
