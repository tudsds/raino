'use client';

import { cn } from '../styles/cn';

export interface StatusDotProps {
  status: 'active' | 'inactive' | 'warning' | 'error' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function StatusDot({ status, size = 'md', label }: StatusDotProps) {
  const statusColors = {
    active: 'bg-[#00ff88]',
    inactive: 'bg-[#71717a]',
    warning: 'bg-[#ffaa00]',
    error: 'bg-[#ff3366]',
    pending: 'bg-[#00f0ff]',
  };

  const statusGlow = {
    active: 'shadow-[0_0_8px_rgba(0,255,136,0.8)]',
    inactive: '',
    warning: 'shadow-[0_0_8px_rgba(255,170,0,0.8)]',
    error: 'shadow-[0_0_8px_rgba(255,51,102,0.8)]',
    pending: 'shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-pixel-pulse',
  };

  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn(sizeStyles[size], statusColors[status], statusGlow[status])} />
      {label && (
        <span className="text-base text-[#a1a1aa] font-[family-name:var(--font-body)]">
          {label}
        </span>
      )}
    </div>
  );
}
