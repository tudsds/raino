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
  const baseStyles = 'inline-flex items-center font-[family-name:var(--font-body)]';

  const variantStyles = {
    default: 'glass-surface text-[#94A3B8]',
    success: 'glass-blue-tint text-[#4CAF50]',
    warning: 'glass-blue-tint text-[#FF9800]',
    error: 'glass-blue-tint text-[#EF5350]',
    info: 'glass-blue-tint text-[#1565C0]',
    neon: 'glass-blue-tint text-[#1565C0] shadow-[0_8px_32px_rgba(0,0,0,0.20)]',
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
