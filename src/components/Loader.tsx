import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-t-primary-500 border-r-transparent border-b-primary-200 border-l-transparent ${sizeClasses[size]}`}
        style={{ borderStyle: 'solid' }}
      />
      {fullScreen && (
        <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-zinc-400 font-sans animate-pulse">
          Optimizing footprint calculations...
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-darkBg transition-colors duration-300">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
