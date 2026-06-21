import React from 'react';
import { Leaf } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <Leaf className="h-10 w-10 text-emerald-500" />,
  actionLabel,
  onAction
}) => {
  return (
    <Card variant="glass" className="flex flex-col items-center justify-center text-center p-12 py-16 border-dashed border-slate-200 dark:border-zinc-800">
      <div className="p-4 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 mb-4 animate-bounce duration-1000">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-sans text-slate-800 dark:text-slate-150 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-450 dark:text-zinc-500 max-w-sm font-sans mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};
