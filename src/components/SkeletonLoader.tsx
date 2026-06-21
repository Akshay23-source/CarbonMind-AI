import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  count = 1,
  className,
  ...props
}) => {
  const baseClass = 'animate-pulse bg-slate-200 dark:bg-zinc-800';

  const variants = {
    text: 'h-4 w-full rounded-md my-2',
    circular: 'h-12 w-12 rounded-full',
    rectangular: 'h-32 w-full rounded-2xl'
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={twMerge(clsx(baseClass, variants[variant], className))}
          {...props}
        />
      ))}
    </>
  );
};
