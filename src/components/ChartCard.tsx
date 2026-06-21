import React from 'react';
import { Card } from './Card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  timeframe?: string;
  onTimeframeChange?: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  timeframe,
  onTimeframeChange,
  children,
  actions
}) => {
  return (
    <Card variant="glass" className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold font-sans text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-zinc-550 font-sans mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onTimeframeChange && timeframe && (
            <div className="flex bg-slate-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
              {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onTimeframeChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    timeframe === t
                      ? 'bg-white dark:bg-zinc-900 text-primary-500 shadow-sm'
                      : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-350'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          {actions}
        </div>
      </div>

      <div className="w-full h-80 min-h-[320px] relative">
        {children}
      </div>
    </Card>
  );
};
