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
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]',
    success: 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30',
    warning: 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30',
    error: 'bg-[#ff3366]/10 text-[#ff3366] border border-[#ff3366]/30',
    info: 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30',
    neon: 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
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
