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
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'bg-[#111118] border border-[#27272a]',
    elevated: 'bg-[#1a1a24] border border-[#3f3f46] shadow-lg',
    outlined: 'bg-transparent border border-[#27272a]',
    neon: 'bg-[#111118] border border-[#00f0ff]/50',
  };

  const glowColorMap = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]',
    purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
    magenta: 'hover:shadow-[0_0_30px_rgba(255,0,170,0.2)]',
  };

  const glowStyles = glow ? glowColorMap[glowColor] : '';

  return (
    <div className={cn(baseStyles, variantStyles[variant], glowStyles, className)} {...props}>
      {children}
    </div>
  );
}
