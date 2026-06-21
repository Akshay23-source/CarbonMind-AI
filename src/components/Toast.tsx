import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { Button } from './Button';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />
  };

  const bgStyles = {
    success: 'bg-emerald-50/90 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-300',
    error: 'bg-red-50/90 dark:bg-red-950/20 border-red-500/20 text-red-800 dark:text-red-300',
    info: 'bg-blue-50/90 dark:bg-blue-950/20 border-blue-500/20 text-blue-800 dark:text-blue-300',
    warning: 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-500/20 text-amber-800 dark:text-amber-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex items-center gap-3 p-4 rounded-xl border glass-card backdrop-blur-md shadow-lg ${bgStyles[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium font-sans flex-1">{message}</span>
      <Button
        variant="ghost"
        size="sm"
        className="p-0.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};
