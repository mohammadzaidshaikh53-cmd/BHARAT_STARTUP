'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const ALERT_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const ALERT_STYLES = {
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-500',
    title: 'text-emerald-700 dark:text-emerald-400',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/15',
    border: 'border-red-500/30',
    icon: 'text-red-500',
    title: 'text-red-700 dark:text-red-400',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/30',
    icon: 'text-amber-500',
    title: 'text-amber-700 dark:text-amber-400',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
    title: 'text-blue-700 dark:text-blue-400',
  },
};

export function Alert({
  type = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) {
  const Icon = ALERT_ICONS[type] || Info;
  const style = ALERT_STYLES[type] || ALERT_STYLES.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springTransition}
      className={`
        relative flex gap-3 p-4 rounded-xl border
        ${style.bg} ${style.border}
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold ${style.title}`}>{title}</h4>
        )}
        <div className="text-sm text-muted-foreground mt-1">
          {children}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </motion.div>
  );
}

/**
 * Inline alert for forms
 */
export function FormAlert({
  type = 'error',
  message,
  className = '',
}) {
  if (!message) return null;

  const Icon = ALERT_ICONS[type] || Info;
  const style = ALERT_STYLES[type] || ALERT_STYLES.error;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-center gap-2 p-3 rounded-lg text-sm
        ${style.bg}
        ${className}
      `}
    >
      <Icon className={`w-4 h-4 shrink-0 ${style.icon}`} />
      <span className={style.title}>{message}</span>
    </motion.div>
  );
}

/**
 * Banner alert for page-level notifications
 */
export function BannerAlert({
  type = 'warning',
  title,
  message,
  action,
  dismissible = true,
  className = '',
}) {
  const Icon = ALERT_ICONS[type] || Info;
  const style = ALERT_STYLES[type] || ALERT_STYLES.warning;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`
        relative overflow-hidden
        ${style.bg} ${style.border} border
        ${className}
      `}
    >
      <div className="container-app py-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 shrink-0 ${style.icon}`} />

          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-semibold inline ${style.title}`}>{title}</h4>
            )}
            {message && (
              <span className="text-sm text-muted-foreground ml-2">{message}</span>
            )}
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className={`
                shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium
                bg-white/10 hover:bg-white/20 transition-colors
              `}
            >
              {action.label}
            </button>
          )}

          {dismissible && (
            <button
              onClick={() => {}}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
