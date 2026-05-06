// app/reset-password/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { cn } from '@/lib/utils'; // ← ADDED
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// -----------------------------------------------------------------------------
// Password strength checker
// -----------------------------------------------------------------------------
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-status-error', 'bg-yellow-500', 'bg-accent-primary', 'bg-green-500'];

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------
const isValidPassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Include at least one special character';
  return null;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // Verify the reset token from URL
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Supabase automatically handles the token in the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Fallback: if no session, try PKCE code exchange
        if (!session) {
          const code = searchParams.get('code');
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
          } else {
            throw new Error('No reset token found');
          }
        }
        
        setVerifying(false);
        setTimeout(() => passwordRef.current?.focus(), 100);
      } catch (err) {
        console.error('Token verification failed:', err);
        setError('Invalid or expired reset link. Please request a new one.');
        setVerifying(false);
      }
    };

    verifySession();
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // Shake helper
  // ---------------------------------------------------------------------------
  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // ---------------------------------------------------------------------------
  // Submit new password
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const validationError = isValidPassword(password);
    if (validationError) {
      setError(validationError);
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setMessage('Password updated successfully!');
      
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (err) {
      console.error('Password update failed:', err);
      setError(err.message || 'Failed to update password. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // ---------------------------------------------------------------------------
  // Loading / verifying state
  // ---------------------------------------------------------------------------
  if (verifying) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" aria-label="Verifying reset link" />
          <p className="text-text-secondary">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="relative min-h-screen bg-bg-base flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10"
      >
        {/* Glass card */}
        <div className="bg-bg-raised/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-black/20 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-cyan-600 mb-4 shadow-glow-sm"
            >
              <ShieldCheckIcon className="w-7 h-7 text-white" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={success ? 'success' : 'reset'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-bold text-text-primary"
              >
                {success ? 'All Set!' : 'Reset Password'}
              </motion.h1>
            </AnimatePresence>

            <p className="text-text-secondary text-sm mt-2">
              {success
                ? 'Your password has been updated. Redirecting...'
                : 'Create a strong, secure password for your account'}
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className={cn('flex items-center gap-2 rounded-xl bg-status-error/10 border border-status-error/20 p-3 text-sm text-status-error', shake && 'animate-shake')}>
                  <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </motion.div>
                <p className="text-text-secondary text-sm mb-6">
                  You can now sign in with your new password
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => router.push('/login')}
                  className="justify-center"
                >
                  Go to Sign In
                  <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence>
            {!success && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* New password */}
                <div className="group">
                  <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary/60 group-focus-within:text-accent-primary transition-colors" />
                    <input
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-bg-base/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-11 text-text-primary placeholder-text-tertiary/40 focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary/60 hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2"
                    >
                      <div className="flex gap-1 h-1 mb-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex-1 rounded-full transition-all duration-300',
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-text-tertiary">
                        <span>{strengthLabels[passwordStrength - 1] || 'Too short'}</span>
                        <span>Min 8 chars, uppercase, number, symbol</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="group">
                  <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary/60 group-focus-within:text-accent-primary transition-colors" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className={cn(
                        'w-full bg-bg-base/50 border rounded-xl py-2.5 pl-11 pr-11 text-text-primary placeholder-text-tertiary/40 focus:outline-none focus:ring-2 transition-all',
                        confirmPassword && !passwordsMatch
                          ? 'border-status-error/50 focus:border-status-error focus:ring-status-error/20'
                          : passwordsMatch
                            ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                            : 'border-white/10 focus:border-accent-primary/50 focus:ring-accent-primary/20'
                      )}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary/60 hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-[11px] text-status-error mt-1">Passwords do not match</p>
                  )}
                  {passwordsMatch && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] text-green-400 mt-1 flex items-center gap-1"
                    >
                      <CheckCircleIcon className="w-3 h-3" />
                      Passwords match
                    </motion.p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading || !passwordsMatch || !password}
                  className="justify-center py-2.5 text-base font-semibold shadow-glow-sm hover:shadow-glow-md transition-shadow"
                >
                  {loading ? (
                    <Spinner className="w-5 h-5" aria-label="Updating password" />
                  ) : (
                    <>
                      Update Password
                      <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to login */}
          {!success && (
            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-text-tertiary hover:text-accent-primary transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}