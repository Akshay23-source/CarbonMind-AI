import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  name?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  status,
  name,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl'
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isDefaultOrEmpty = !src || 
    src.includes('photo-1472099645785-5658abf4ff4e') || 
    src.includes('photo-1534528741775-53994a69daeb') ||
    src.includes('dicebear.com/7.x/bottts');
  
  const avatarSrc = isDefaultOrEmpty 
    ? 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=128&h=128&fit=crop&q=80' 
    : src;

  return (
    <div className="relative inline-block select-none">
      <img
        src={avatarSrc}
        alt={alt}
        className={twMerge(
          clsx(
            'rounded-full object-cover border border-slate-200/80 dark:border-zinc-800 bg-slate-50',
            sizeClasses[size],
            className
          )
        )}
        {...props}
      />

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-darkBg ${
            size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
          } ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'offline'
              ? 'bg-slate-400'
              : 'bg-amber-500'
          }`}
        />
      )}
    </div>
  );
};
