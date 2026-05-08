'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default', // 'default' | 'danger' | 'success'
  loading = false,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDanger = variant === 'danger';

  const buttonStyles = isDanger
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-primary hover:bg-primary/90';

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springTransition}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                {description && (
                  <p className="mt-2 text-muted-foreground">{description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-6 pt-0">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={onConfirm}
                  loading={loading}
                  className={buttonStyles}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for confirm dialog
 */
export function useConfirm() {
  const [config, setConfig] = useState({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'default',
  });

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfig({
        open: true,
        ...options,
        onConfirm: () => {
          setConfig((prev) => ({ ...prev, open: false }));
          resolve(true);
        },
        onClose: () => {
          setConfig((prev) => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={config.open}
      onClose={() => {
        setConfig((prev) => ({ ...prev, open: false }));
      }}
      onConfirm={config.onConfirm}
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      variant={config.variant}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
