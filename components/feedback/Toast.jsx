'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '@/lib/store';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-500',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/30',
    icon: 'text-amber-500',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
  },
};

function ToastItem({ toast, onDismiss }) {
  const Icon = TOAST_ICONS[toast.type] || Info;
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={springTransition}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        ${style.bg} ${style.border}
        shadow-lg shadow-black/5 dark:shadow-black/20
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-foreground text-sm">{toast.title}</p>
        )}
        <p className="text-sm text-muted-foreground">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-600"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.icon} opacity-30 origin-left`}
        />
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to use toast from anywhere
 */
export function useToast() {
  const toastStore = useToastStore();

  return {
    success: (message, options = {}) =>
      toastStore.addToast({ message, type: 'success', ...options }),
    error: (message, options = {}) =>
      toastStore.addToast({ message, type: 'error', duration: 6000, ...options }),
    warning: (message, options = {}) =>
      toastStore.addToast({ message, type: 'warning', ...options }),
    info: (message, options = {}) =>
      toastStore.addToast({ message, type: 'info', ...options }),
    custom: (toast) => toastStore.addToast(toast),
    dismiss: (id) => toastStore.removeToast(id),
    dismissAll: () => toastStore.clearAll(),
  };
}
