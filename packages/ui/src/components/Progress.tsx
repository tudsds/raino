'use client';

import { cn } from '../styles/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'neon';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-5',
  };

  const fillStyles = {
    default: 'bg-[#1565C0] rounded-full',
    neon: 'bg-[#1565C0] rounded-full',
  };

  return (
    <div className="w-full">
      <div className={cn('w-full bg-white/[0.08] overflow-hidden rounded-full', sizeStyles[size])}>
        <div
          className={cn('h-full transition-all duration-300', fillStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-2 text-base text-[#64748B] font-[family-name:var(--font-body)]">
          <span>{Math.round(percentage)}%</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}
