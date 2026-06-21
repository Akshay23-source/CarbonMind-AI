import React from 'react';
import { Card } from './Card';

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  subtitle?: string;
  type?: 'bar' | 'ring';
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  max,
  unit,
  subtitle,
  type = 'bar'
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Dynamic color depending on footprint size
  const color = percentage < 50 
    ? 'from-emerald-500 to-teal-400' 
    : percentage < 80 
    ? 'from-cyan-500 to-sky-400' 
    : 'from-amber-500 to-rose-500';

  if (type === 'ring') {
    const radius = 50;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Card variant="glass" className="flex items-center justify-between p-6">
        <div className="space-y-1 pr-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">
            {value} <span className="text-sm font-normal text-slate-400 dark:text-zinc-500">{unit}</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-400">
            Budget limit: {max} {unit}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-450 dark:text-zinc-450 mt-1 italic">
              {subtitle}
            </p>
          )}
        </div>

        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Trail */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-slate-100 dark:stroke-zinc-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Value stroke */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="transition-all duration-1000 ease-out"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-emerald-500" stopColor="currentColor" />
                <stop offset="100%" className="text-teal-400" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {percentage}%
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100">
            {value} <span className="text-sm font-normal text-slate-400 dark:text-zinc-500">{unit}</span>
          </h3>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-slate-700 dark:text-slate-250">
            {percentage}%
          </span>
          <p className="text-xs text-slate-400 dark:text-zinc-500">of daily limit</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500">
        <span>0 {unit}</span>
        {subtitle && <span>{subtitle}</span>}
        <span>Target: {max} {unit}</span>
      </div>
    </Card>
  );
};
