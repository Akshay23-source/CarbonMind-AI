import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry
}) => {
  return (
    <Card variant="glass" className="flex flex-col items-center justify-center text-center p-8 border-red-500/10 dark:border-red-500/5 bg-red-500/5">
      <div className="p-3.5 rounded-full bg-red-500/10 text-red-500 mb-4 animate-pulse">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold font-sans text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 max-w-md font-sans mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </Card>
  );
};
