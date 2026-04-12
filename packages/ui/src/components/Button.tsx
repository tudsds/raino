'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  glow = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] font-[family-name:var(--font-body)]';

  const variantStyles = {
    primary: [
      'bg-[#0a0a0f] border-2 border-[#00f0ff] text-[#00f0ff]',
      'hover:bg-[#00f0ff]/10',
      'focus-visible:ring-[#00f0ff]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
    secondary: [
      'bg-[#0a0a0f] border-2 border-[#8b5cf6] text-[#8b5cf6]',
      'hover:bg-[#8b5cf6]/10',
      'focus-visible:ring-[#8b5cf6]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
    ghost: [
      'bg-transparent border-2 border-transparent text-[#a1a1aa]',
      'hover:text-[#e4e4e7] hover:border-[#27272a]',
      'focus-visible:ring-[#71717a]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
    danger: [
      'bg-[#0a0a0f] border-2 border-[#ff3366] text-[#ff3366]',
      'hover:bg-[#ff3366]/10',
      'focus-visible:ring-[#ff3366]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-base',
    md: 'px-4 py-2 text-lg',
    lg: 'px-6 py-3 text-xl',
  };

  const glowStyles = {
    primary:
      glow && !disabled
        ? 'hover:shadow-[0_0_0_2px_rgba(0,240,255,0.3),0_0_10px_rgba(0,240,255,0.5)]'
        : '',
    secondary:
      glow && !disabled
        ? 'hover:shadow-[0_0_0_2px_rgba(139,92,246,0.3),0_0_10px_rgba(139,92,246,0.5)]'
        : '',
    ghost: '',
    danger:
      glow && !disabled
        ? 'hover:shadow-[0_0_0_2px_rgba(255,51,102,0.3),0_0_10px_rgba(255,51,102,0.5)]'
        : '',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        glowStyles[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
