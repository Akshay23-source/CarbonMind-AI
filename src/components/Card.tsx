import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'flat';
  hoverable?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverable = false,
  glow = false,
  ...props
}) => {
  const baseClass = 'rounded-2xl p-6 transition-all duration-300 font-sans border';
  
  const variants = {
    default: 'bg-white border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800 shadow-premium dark:shadow-premium-dark',
    glass: 'glass-card',
    flat: 'bg-slate-50 border-transparent dark:bg-zinc-900/30'
  };

  const interactiveClass = hoverable
    ? 'hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-premium-dark border-transparent hover:border-primary-500/30 dark:hover:border-primary-500/20'
    : '';

  const glowClass = glow
    ? 'relative before:absolute before:inset-0 before:rounded-2xl before:-z-10 before:bg-gradient-to-r before:from-primary-500/10 before:to-secondary-500/10 before:blur-xl'
    : '';

  return (
    <div
      className={twMerge(clsx(baseClass, variants[variant], interactiveClass, glowClass, className))}
      {...props}
    >
      {children}
    </div>
  );
};
