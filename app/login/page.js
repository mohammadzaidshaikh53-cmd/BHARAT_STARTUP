// app/login/page.js
'use client';

import { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// -----------------------------------------------------------------------------
// Password strength checker (enhanced)
// -----------------------------------------------------------------------------
const getPasswordStrength = (password) => {
  let score = 0;
  const length = password.length;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
};

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['bg-status-error', 'bg-yellow-500', 'bg-orange-500', 'bg-accent-primary', 'bg-green-500'];

// -----------------------------------------------------------------------------
// Validation (enhanced)
// -----------------------------------------------------------------------------
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

// ✅ HYDRATION-SAFE SUPABASE ERROR MESSAGES
const getUserFriendlyError = (errorMessage) => {
  if (!errorMessage) return 'Something went wrong. Please try again.';
  
  const lower = errorMessage.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your email to confirm your account.';
  }
  if (lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment.';
  }
  if (lower.includes('email already registered')) {
    return 'Email already registered. Try signing in.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  return errorMessage.length > 100 ? 'Something went wrong. Please try again.' : errorMessage;
};

// ============================================================================
// FIX 1 & 4 Helpers
// ============================================================================
const ALLOWED_REDIRECTS = ['/', '/dashboard', '/profile'];

const getSafeRedirect = (redirectParam) => {
  if (!redirectParam) return '/';
  if (ALLOWED_REDIRECTS.includes(redirectParam)) return redirectParam;
  return '/';
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorId = useId();
  const shouldReduceMotion = useReducedMotion();

  // Animation variants (POLISH: smoother, faster defaults)
  const springTransition = {
    type: 'spring',
    stiffness: shouldReduceMotion ? 300 : 280,
    damping: shouldReduceMotion ? 30 : 24,
  };
  
  const fadeTransition = {
    duration: shouldReduceMotion ? 0.15 : 0.2,
    ease: [0.2, 0.9, 0.4, 1],
  };

  // ✅ HYDRATION-SAFE searchParams access
  const editId = useMemo(() => {
    try {
      return searchParams?.get('edit') || null;
    } catch {
      return null;
    }
  }, [searchParams]);

  // FIX 1: Force reset redirect param – hard block '/chat'
  const redirectTo = useMemo(() => {
    try {
      const raw = searchParams?.get('redirect');
      if (!raw || raw === '/chat') return '/';
      return getSafeRedirect(raw);
    } catch {
      return '/';
    }
  }, [searchParams]);

  const emailRef = useRef(null);
  const submitTimeoutRef = useRef(null);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [shake, setShake] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // FIX 2: Remove auto‑session redirect – let UI render
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let abortController = new AbortController();
    let mounted = true;

    const checkSession = async () => {
      if (abortController.signal.aborted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error && mounted) {
          console.error('Session check failed:', error);
        }

        // ✅ FIX 2: Do nothing on existing session – no auto‑redirect
        // Removed the router.replace block entirely.
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Unexpected error checking session:', err);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [router, searchParams]);

  // ✅ UX: Auto-focus email + retain focus on validation error
  useEffect(() => {
    if (!checkingSession && emailRef.current) {
      const timeoutId = setTimeout(() => {
        if (!email.trim() || !isValidEmail(email)) {
          emailRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [checkingSession, email]);

  // ✅ Clear messages + reset submission state on mode switch
  useEffect(() => {
    setError(null);
    setMessage(null);
    setHasSubmitted(false);
  }, [mode]);

  // ✅ Auto-clear success message after 6s
  useEffect(() => {
    if (message) {
      const timeoutId = setTimeout(() => setMessage(null), 6000);
      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  // ---------------------------------------------------------------------------
  // ✅ STABILITY: Shake with proper cleanup
  // ---------------------------------------------------------------------------
  const triggerShake = useCallback(() => {
    if (shake) return;
    setShake(true);
    const timeoutId = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(timeoutId);
  }, [shake]);

  // ---------------------------------------------------------------------------
  // ✅ SAFETY: Prevent double-submit + better error handling
  // ---------------------------------------------------------------------------
  const executeSubmit = useCallback(async (submitFn) => {
    if (loading || hasSubmitted || submitTimeoutRef.current) return false;

    setHasSubmitted(true);
    submitTimeoutRef.current = setTimeout(() => {
      submitTimeoutRef.current = null;
    }, 1000);

    try {
      await submitFn();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setHasSubmitted(false);
    }
  }, [loading, hasSubmitted]);

  const handleLogin = useCallback(async (e) => {
    e?.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both email and password');
      triggerShake();
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }

    const success = await executeSubmit(async () => {
      setLoading(true);
      try {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: trimmedEmail.toLowerCase(),
          password,
        });
        if (error) throw error;

        if (rememberMe && data?.session) {
          try {
            localStorage.setItem('remember_auth', 'true');
          } catch {}
        }

        const safeRedirect = redirectTo === '/chat' ? '/' : redirectTo;
        router.push(safeRedirect);
      } finally {
        setLoading(false);
      }
    });

    if (!success) return;

  }, [email, password, rememberMe, redirectTo, router, triggerShake, executeSubmit]);

  const handleRegister = useCallback(async (e) => {
    e?.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }

    const success = await executeSubmit(async () => {
      setLoading(true);
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail.toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${origin}/login?confirmed=true`,
          },
        });
        if (error) throw error;

        setMessage('🎉 Account created! Check your email to confirm.');
        setPassword('');
        setConfirmPassword('');
      } finally {
        setLoading(false);
      }
    });

    if (!success) return;
  }, [email, password, confirmPassword, triggerShake, executeSubmit]);

  const handleForgot = useCallback(async (e) => {
    e?.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter your email to reset password');
      triggerShake();
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }

    const success = await executeSubmit(async () => {
      setLoading(true);
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.resetPasswordForEmail(
          trimmedEmail.toLowerCase(),
          { redirectTo: `${origin}/reset-password` }
        );
        if (error) throw error;

        setMessage('📧 Reset link sent! Check your inbox.');
      } finally {
        setLoading(false);
      }
    });

    if (!success) return;
  }, [email, triggerShake, executeSubmit]);

  const handleSocialLogin = useCallback(async (provider) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const finalRedirect = redirectTo === '/chat' ? '/' : redirectTo;
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${origin}${finalRedirect}` },
      });
    } catch (err) {
      setError(getUserFriendlyError(err.message));
    } finally {
      setLoading(false);
    }
  }, [redirectTo, loading]);

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const passwordStrength = getPasswordStrength(password);
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (isForgot) {
      handleForgot(e);
    } else if (isLogin) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  }, [isLogin, isRegister, isForgot, handleLogin, handleRegister, handleForgot]);

  const isFormValid = useMemo(() => {
    const trimmedEmail = email.trim();
    if (isForgot) return !!trimmedEmail && isValidEmail(trimmedEmail);
    if (isLogin) return !!trimmedEmail && !!password && isValidEmail(trimmedEmail);
    return !!trimmedEmail && !!password && !!confirmPassword && 
           password === confirmPassword && password.length >= 8 && isValidEmail(trimmedEmail);
  }, [email, password, confirmPassword, isLogin, isRegister, isForgot]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springTransition}
          className="text-center max-w-sm"
        >
          <Spinner className="w-9 h-9 mx-auto mb-4 text-accent-primary/80" />
          <p className="text-text-secondary text-sm font-medium">Checking session...</p>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render (POLISH: refined spacing, typography, alignment)
  // ---------------------------------------------------------------------------
  return (
    <div className="relative min-h-screen bg-bg-base flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* softer background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/3 via-transparent to-cyan-500/3" />
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.4, 1] }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-bg-raised/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/10 p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary via-cyan-500 to-blue-600 mb-5 shadow-md mx-auto"
            >
              <SparklesIcon className="w-7 h-7 text-white" />
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary/95"
              >
                {isLogin ? 'Welcome back' : isRegister ? 'Create account' : 'Reset password'}
              </motion.h1>
            </AnimatePresence>
            
            <p className="text-text-secondary text-sm mt-1.5 max-w-[85%] mx-auto leading-relaxed">
              {isLogin
                ? 'Sign in to continue'
                : isRegister
                  ? 'Join the community'
                  : "We'll send you a reset link"}
            </p>
          </div>

          {/* Alerts - refined styling */}
          <AnimatePresence>
            {error && (
              <motion.div
                id={errorId}
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <motion.div 
                  animate={shake ? { x: shouldReduceMotion ? [0] : [-2, 2, -1, 0] } : {}}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl bg-status-error/10 border border-status-error/20 p-3 text-sm text-status-error'
                  )}
                >
                  <XCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-start gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form - refined spacing */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="email"
                className="block text-xs font-medium text-text-tertiary/90 uppercase tracking-wide"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary/60">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  className={cn(
                    'w-full bg-bg-base/50 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-text-primary placeholder:text-text-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                    'hover:border-white/20 focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20',
                    error && 'border-status-error/50 focus:border-status-error/50 focus:ring-status-error/20'
                  )}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
            </div>

            {/* Password fields */}
            <AnimatePresence mode="wait">
              {!isForgot && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="password"
                      className="block text-xs font-medium text-text-tertiary/90 uppercase tracking-wide"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary/60">
                        <LockClosedIcon className="w-4 h-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        className="w-full bg-bg-base/50 border border-white/10 rounded-xl py-2.5 pl-9 pr-9 text-text-primary placeholder:text-text-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:border-white/20 focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary/60 hover:text-text-primary transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={loading}
                      >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isRegister && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 p-3 bg-bg-base/30 rounded-lg border border-white/5"
                    >
                      <div className="flex gap-1 h-1.5 mb-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ width: 0 }}
                            animate={{ width: i < passwordStrength ? '100%' : '20%' }}
                            className={cn(
                              'h-full rounded-full transition-all',
                              i < passwordStrength 
                                ? strengthColors[Math.min(passwordStrength - 1, 4)] 
                                : 'bg-white/10'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-text-tertiary font-medium">
                        {strengthLabels[Math.min(passwordStrength - 1, 4)] || 'Too short'}
                        <span className="text-text-tertiary/70 ml-1">
                          – 8+ chars, mixed case, number, symbol
                        </span>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm password */}
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="confirm-password"
                      className="block text-xs font-medium text-text-tertiary/90 uppercase tracking-wide"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary/60">
                        <LockClosedIcon className="w-4 h-4" />
                      </div>
                      <input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className={cn(
                          'w-full bg-bg-base/50 border rounded-xl py-2.5 pl-9 pr-9 text-text-primary placeholder:text-text-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                          confirmPassword && password !== confirmPassword
                            ? 'border-status-error/50 focus:border-status-error/50 focus:ring-status-error/20'
                            : 'border-white/10 hover:border-white/20 focus:border-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/20'
                        )}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary/60 hover:text-text-primary transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        disabled={loading}
                      >
                        {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-status-error font-medium mt-1 flex items-center gap-1"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me + forgot */}
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                      disabled={loading}
                    />
                    <div className="w-4 h-4 border-2 border-white/30 rounded bg-bg-base/50 peer-checked:bg-accent-primary peer-checked:border-accent-primary transition-colors" />
                    <CheckCircleIcon className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-accent-primary hover:text-accent-primary/80 text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button - refined */}
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!isFormValid || loading || hasSubmitted}
                className={cn(
                  'group relative py-2.5 text-base font-medium rounded-xl transition-all duration-200',
                  'hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
                  'bg-gradient-to-br from-accent-primary to-accent-primary/90 hover:from-accent-primary/95 hover:to-accent-primary',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:ring-offset-2 focus:ring-offset-bg-base'
                )}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : isRegister ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </div>
          </form>

          {/* Social login divider */}
          {!isForgot && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg-raised/95 px-4 py-1 text-text-tertiary/70 uppercase tracking-wider rounded-full backdrop-blur-sm">
                  or
                </span>
              </div>
            </div>
          )}

          {/* Social login buttons - refined */}
          {!isForgot && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  provider: 'google',
                  label: 'Google',
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )
                },
                {
                  provider: 'github',
                  label: 'GitHub',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )
                }
              ].map(({ provider, label, icon }) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSocialLogin(provider)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-bg-base/50 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all disabled:opacity-50"
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mode switcher */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${mode}-switcher`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-text-secondary"
              >
                {isLogin ? (
                  <>
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      disabled={loading}
                      className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                    >
                      Create account
                    </button>
                  </>
                ) : isRegister ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      disabled={loading}
                      className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      disabled={loading}
                      className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-text-tertiary/60 mt-6 font-mono tracking-tight">
          Protected by encryption • GDPR compliant
        </p>
      </motion.div>

      {/* Minimal shake keyframes retained */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97);
        }
      `}</style>
    </div>
  );
}