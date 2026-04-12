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
    default: 'bg-[#27272a] text-[#a1a1aa] border-2 border-[#3f3f46]',
    success: 'bg-[#00ff88]/10 text-[#00ff88] border-2 border-[#00ff88]',
    warning: 'bg-[#ffaa00]/10 text-[#ffaa00] border-2 border-[#ffaa00]',
    error: 'bg-[#ff3366]/10 text-[#ff3366] border-2 border-[#ff3366]',
    info: 'bg-[#00f0ff]/10 text-[#00f0ff] border-2 border-[#00f0ff]',
    neon: 'bg-[#00f0ff]/10 text-[#00f0ff] border-2 border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]',
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
