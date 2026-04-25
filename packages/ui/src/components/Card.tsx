'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'neon';
  glow?: boolean;
  glowColor?: 'cyan' | 'purple' | 'magenta';
}

export function Card({
  variant = 'default',
  glow = false,
  glowColor = 'cyan',
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'transition-all duration-300 rounded-xl';

  const variantStyles = {
    default: 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)]',
    elevated: 'bg-white/[0.08] backdrop-blur-xl border border-white/[0.16] shadow-[0_12px_40px_rgba(0,0,0,0.24)]',
    outlined: 'bg-transparent border border-white/[0.12]',
    neon: 'bg-white/[0.06] backdrop-blur-xl border border-[#1565C0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.20)]',
  };

  const glowColorMap = {
    cyan: 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)] hover:-translate-y-0.5',
    purple: 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)] hover:-translate-y-0.5',
    magenta: 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)] hover:-translate-y-0.5',
  };

  const glowStyles = glow ? glowColorMap[glowColor] : '';

  return (
    <div className={cn(baseStyles, variantStyles[variant], glowStyles, className)} {...props}>
      {children}
    </div>
  );
}
