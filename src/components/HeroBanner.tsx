import React from 'react';
import { Card } from './Card';

interface HeroBannerProps {
  title: string;
  description: string;
  imageSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  description,
  imageSlot,
  actionsSlot
}) => {
  return (
    <Card
      variant="glass"
      className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-primary-500/5 to-secondary-500/10 dark:from-emerald-500/5 dark:via-zinc-950/20 dark:to-secondary-500/5 border-primary-500/20 p-8 md:p-12 mb-8"
    >
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary-500/10 dark:bg-secondary-500/5 blur-3xl -z-10" />
      
      <div className="grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans leading-tight">
            {title}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 font-sans leading-relaxed max-w-xl">
            {description}
          </p>
          {actionsSlot && (
            <div className="flex items-center gap-3 pt-2">
              {actionsSlot}
            </div>
          )}
        </div>

        {imageSlot && (
          <div className="flex justify-center md:justify-end animate-float">
            {imageSlot}
          </div>
        )}
      </div>
    </Card>
  );
};
