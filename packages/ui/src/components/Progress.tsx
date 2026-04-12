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
    default: 'bg-[#00f0ff]',
    neon: 'bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)]',
  };

  return (
    <div className="w-full">
      <div className={cn('w-full bg-[#27272a] overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full transition-all duration-100', fillStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-2 text-base text-[#71717a] font-[family-name:var(--font-body)]">
          <span>{Math.round(percentage)}%</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}
