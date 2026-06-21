import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. -12.4 for 12.4% reduction
  changeLabel?: string; // e.g. "vs last month"
  icon: React.ReactNode;
  isNegativeBetter?: boolean; // For carbon footprints, decreasing is better!
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  isNegativeBetter = true
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === 0 || change === undefined;
  
  // Decide color scheme for changes
  const isGoodChange = isNegativeBetter ? !isPositive : isPositive;

  return (
    <Card variant="glass" hoverable className="relative overflow-hidden group">
      {/* Decorative Blur Background */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-primary-500/5 group-hover:bg-primary-500/10 blur-xl transition-all duration-500" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-sans">
            {title}
          </p>
          <h3 className="text-3xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
        </div>
        
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-primary-500 dark:text-primary-400 border border-slate-100 dark:border-zinc-800/80 group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 font-sans">
          <span
            className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
              isNeutral
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                : isGoodChange
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            {isNeutral ? null : isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
            )}
            {change > 0 ? `+${change}` : change}%
          </span>
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            {changeLabel}
          </span>
        </div>
      )}
    </Card>
  );
};
