'use client';

import { cn } from '../styles/cn';

export interface StatusDotProps {
  status: 'active' | 'inactive' | 'warning' | 'error' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function StatusDot({ status, size = 'md', label }: StatusDotProps) {
  const statusColors = {
    active: 'bg-[#4CAF50]',
    inactive: 'bg-[#64748B]',
    warning: 'bg-[#FF9800]',
    error: 'bg-[#EF5350]',
    pending: 'bg-[#1565C0]',
  };

  const statusGlow = {
    active: '',
    inactive: '',
    warning: '',
    error: '',
    pending: 'animate-pulse',
  };

  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded-full', sizeStyles[size], statusColors[status], statusGlow[status])} />
      {label && (
        <span className="text-base text-[#94A3B8] font-[family-name:var(--font-body)]">
          {label}
        </span>
      )}
    </div>
  );
}
