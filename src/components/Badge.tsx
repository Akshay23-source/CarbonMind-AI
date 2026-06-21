import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'premium';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'sm',
  ...props
}) => {
  const baseClass = 'inline-flex items-center justify-center font-semibold rounded-lg font-sans transition-all';
  
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
    success: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    info: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    error: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    premium: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 glow-blue'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={twMerge(clsx(baseClass, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};
