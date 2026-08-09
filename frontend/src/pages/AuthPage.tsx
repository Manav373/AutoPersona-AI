import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Eye, EyeOff, ArrowRight, Play, Mail,
  Lock, User, Brain, Zap, Globe, Shield, ChevronLeft, Activity,
  CheckCircle2, AlertCircle, Check, X
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});

  const validateEmail = (val: string): string => {
    if (!val.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address (e.g. name@domain.com)';
    return '';
  };

  const validateName = (val: string): string => {
    if (!val.trim()) return 'Full name is required';
    if (val.trim().length < 2) return 'Name must be at least 2 characters long';
    if (!/^[a-zA-Z\s'-]+$/.test(val.trim())) return 'Name contains invalid characters';
    return '';
  };

  const validatePassword = (val: string): string => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter (A-Z)';
    if (!/[0-9]/.test(val)) return 'Password must contain at least one number (0-9)';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) return 'Password must contain at least one special character';
    return '';
  };

  // Password Strength Calculation (0 to 4)
  const getPasswordScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score++;
    return score;
  };

  const passwordScore = getPasswordScore(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return { label: 'Too Weak', color: '#ef4444' };
      case 1: return { label: 'Weak', color: '#f97316' };
      case 2: return { label: 'Fair', color: '#eab308' };
      case 3: return { label: 'Good', color: '#3b82f6' };
      case 4: return { label: 'Strong', color: '#22c55e' };
      default: return { label: '', color: '#9d9db8' };
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    if (field === 'name') setErrors((prev) => ({ ...prev, name: validateName(name) }));
    if (field === 'password') {
      if (mode === 'signup') {
        setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
      } else {
        setErrors((prev) => ({ ...prev, password: !password ? 'Password is required' : '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    let nameErr = '';
    let passErr = '';

    if (mode === 'signup') {
      nameErr = validateName(name);
      passErr = validatePassword(password);
    } else {
      passErr = !password ? 'Password is required' : '';
    }

    setTouched({ name: true, email: true, password: true });
    setErrors({ name: nameErr, email: emailErr, password: passErr });

    if (emailErr || nameErr || passErr) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem('autopersona_session', JSON.stringify({
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        loginTime: new Date().toISOString()
      }));
      navigate(redirectTarget);
    }, 900);
  };

  const handleDemo = () => {
    localStorage.setItem('autopersona_session', JSON.stringify({
      email: 'demo@autopersona.ai',
      name: 'Demo Creator',
      isDemo: true,
      loginTime: new Date().toISOString()
    }));
    navigate(redirectTarget);
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setTouched({});
  };

  return (
    <div
      style={{
        width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
        background: '#07070e', color: '#ffffff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px',
      }}
    >
      {/* Ambient Orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: '#6366f1', filter: 'blur(120px)', opacity: 0.3, top: '-100px', left: '15%' }} />
        <div style={{ position: 'absolute', width: '450px', height: '450px', borderRadius: '50%', background: '#8b5cf6', filter: 'blur(120px)', opacity: 0.25, bottom: '-100px', right: '15%' }} />
      </div>

      {/* Main Container Card */}
      <div
        style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: '960px', minHeight: '560px',
          background: 'rgba(16, 16, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px', backdropFilter: 'blur(20px)', boxShadow: '0 32px 100px rgba(0, 0, 0, 0.7)',
          display: 'flex', overflow: 'hidden',
        }}
      >
        {/* Left Side — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            flex: 1, padding: '40px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', position: 'relative',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent',
              border: 'none', color: '#9d9db8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              width: 'fit-content', transition: 'color 0.15s ease',
            }}
          >
            <ChevronLeft size={16} /> Back to Home
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: 'auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#ffffff',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}>
                <Sparkles size={24} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                CogniPulse
              </h1>
            </div>

            <p style={{ fontSize: '13px', color: '#9d9db8', lineHeight: 1.6, margin: 0 }}>
              Deploy AI agents that autonomously discover, evaluate, and publish content with a consistent voice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
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
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#f4f4f5', fontWeight: 500 }}
                  >
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} />
                    </div>
                    <span>{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(34, 197, 94, 0.25)', width: 'fit-content' }}>
            <Activity size={12} className="spin" /> Autonomous Engine Online
          </div>
        </motion.div>

        {/* Right Side — Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}
        >
          <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                    {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#9d9db8', marginTop: '4px', margin: 0 }}>
                    {mode === 'signin'
                      ? 'Sign in to access your autonomous persona workspace'
                      : 'Register to start deploying intelligent AI agents'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {mode === 'signup' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9d9db8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="#818cf8" /> Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (touched.name) setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }));
                        }}
                        onBlur={() => handleBlur('name')}
                        style={{
                          width: '100%', padding: '10px 14px', background: 'rgba(20, 20, 32, 0.85)',
                          border: touched.name && errors.name ? '1px solid #ef4444' : touched.name && !errors.name ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
                          boxSizing: 'border-box', transition: 'border-color 0.15s ease',
                        }}
                      />
                      {touched.name && errors.name && (
                        <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <AlertCircle size={12} /> {errors.name}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Email Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#9d9db8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="#818cf8" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('email')}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'rgba(20, 20, 32, 0.85)',
                        border: touched.email && errors.email ? '1px solid #ef4444' : touched.email && !errors.email ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
                        boxSizing: 'border-box', transition: 'border-color 0.15s ease',
                      }}
                    />
                    {touched.email && errors.email && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <AlertCircle size={12} /> {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#9d9db8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={13} color="#818cf8" /> Password
                    </label>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (touched.password) {
                            const errStr = mode === 'signup' ? validatePassword(e.target.value) : (!e.target.value ? 'Password is required' : '');
                            setErrors((prev) => ({ ...prev, password: errStr }));
                          }
                        }}
                        onBlur={() => handleBlur('password')}
                        style={{
                          width: '100%', padding: '10px 40px 10px 14px', background: 'rgba(20, 20, 32, 0.85)',
                          border: touched.password && errors.password ? '1px solid #ef4444' : touched.password && !errors.password ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
                          boxSizing: 'border-box', transition: 'border-color 0.15s ease',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: '12px', background: 'transparent',
                          border: 'none', color: '#9d9db8', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', padding: '2px',
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <AlertCircle size={12} /> {errors.password}
                      </span>
                    )}

                    {/* Registration Password Strength Meter */}
                    {mode === 'signup' && password.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#9d9db8', fontWeight: 600 }}>
                          <span>Password Strength:</span>
                          <span style={{ color: getStrengthLabel(passwordScore).color, fontWeight: 700 }}>
                            {getStrengthLabel(passwordScore).label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', height: '4px', width: '100%' }}>
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              style={{
                                flex: 1, borderRadius: '2px',
                                background: step <= passwordScore ? getStrengthLabel(passwordScore).color : 'rgba(255, 255, 255, 0.1)',
                                transition: 'background 0.2s ease',
                              }}
                            />
                          ))}
                        </div>
                        {/* Rules Checklist */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px', fontSize: '10px' }}>
                          <span style={{ color: password.length >= 8 ? '#22c55e' : '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {password.length >= 8 ? <Check size={10} /> : <X size={10} />} 8+ characters
                          </span>
                          <span style={{ color: /[A-Z]/.test(password) ? '#22c55e' : '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {/[A-Z]/.test(password) ? <Check size={10} /> : <X size={10} />} Uppercase (A-Z)
                          </span>
                          <span style={{ color: /[0-9]/.test(password) ? '#22c55e' : '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {/[0-9]/.test(password) ? <Check size={10} /> : <X size={10} />} Number (0-9)
                          </span>
                          <span style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '#22c55e' : '#71717a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? <Check size={10} /> : <X size={10} />} Special char
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: '6px', width: '100%', padding: '11px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)',
                      fontFamily: 'Inter, sans-serif', opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      'Authenticating...'
                    ) : (
                      <>
                        {mode === 'signin' ? 'Sign In to Workspace' : 'Create & Launch Account'}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 14px', color: '#71717a', fontSize: '11px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <span>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                </div>

                <button
                  onClick={handleDemo}
                  style={{
                    width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff',
                    borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Play size={14} /> Quick Demo Access
                </button>

                <div style={{ textAlign: 'center', fontSize: '12px', color: '#9d9db8', marginTop: '16px' }}>
                  {mode === 'signin' ? (
                    <p style={{ margin: 0 }}>
                      Don't have an account?{' '}
                      <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        Create one
                      </button>
                    </p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      Already have an account?{' '}
                      <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
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

