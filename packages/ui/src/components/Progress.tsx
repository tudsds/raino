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
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const fillStyles = {
    default: 'bg-[#00f0ff]',
    neon: 'bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.5)]',
  };

  return (
    <div className="w-full">
      <div className={cn('w-full bg-[#27272a] rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            fillStyles[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-2 text-sm text-[#71717a]">
          <span>{Math.round(percentage)}%</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}
