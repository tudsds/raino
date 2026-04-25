'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neon';
  size?: 'sm' | 'md';
}

export function Badge({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-[family-name:var(--font-body)] rounded-lg';

  const variantStyles = {
    default: 'bg-white/[0.06] text-[#94A3B8] border border-white/[0.12] backdrop-blur-sm',
    success: 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 backdrop-blur-sm',
    warning: 'bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/30 backdrop-blur-sm',
    error: 'bg-[#EF5350]/10 text-[#EF5350] border border-[#EF5350]/30 backdrop-blur-sm',
    info: 'bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/30 backdrop-blur-sm',
    neon: 'bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/30 shadow-[0_8px_32px_rgba(0,0,0,0.20)] backdrop-blur-sm',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-base',
    md: 'px-3 py-1 text-lg',
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
