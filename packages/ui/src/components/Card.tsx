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
  const baseStyles = 'transition-all duration-100';

  const variantStyles = {
    default: 'bg-[#111118] border-2 border-[#27272a]',
    elevated: 'bg-[#1a1a24] border-2 border-[#3f3f46]',
    outlined: 'bg-transparent border-2 border-[#27272a]',
    neon: 'bg-[#111118] border-2 border-[#00f0ff]',
  };

  const glowColorMap = {
    cyan: 'hover:shadow-[0_0_0_2px_rgba(0,240,255,0.3),0_0_10px_rgba(0,240,255,0.4)]',
    purple: 'hover:shadow-[0_0_0_2px_rgba(139,92,246,0.3),0_0_10px_rgba(139,92,246,0.4)]',
    magenta: 'hover:shadow-[0_0_0_2px_rgba(255,0,170,0.3),0_0_10px_rgba(255,0,170,0.4)]',
  };

  const glowStyles = glow ? glowColorMap[glowColor] : '';

  return (
    <div className={cn(baseStyles, variantStyles[variant], glowStyles, className)} {...props}>
      {children}
    </div>
  );
}
