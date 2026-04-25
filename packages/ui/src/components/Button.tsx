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
    'inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1929] font-[family-name:var(--font-body)] rounded-lg';

  const variantStyles = {
    primary: [
      'bg-[#1565C0] border-2 border-[#1565C0] text-white',
      'hover:bg-[#1565C0]/90',
      'focus-visible:ring-[#1565C0]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
    secondary: [
      'bg-white/[0.06] backdrop-blur-xl border-2 border-white/[0.12] text-[#E2E8F0]',
      'hover:bg-white/[0.10] hover:border-white/[0.20]',
      'focus-visible:ring-[#6191D3]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
    ghost: [
      'bg-transparent border-2 border-transparent text-[#94A3B8]',
      'hover:text-[#E2E8F0] hover:border-white/[0.12]',
      'focus-visible:ring-[#64748B]',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ],
    danger: [
      'bg-[#EF5350]/10 border-2 border-[#EF5350] text-[#EF5350]',
      'hover:bg-[#EF5350]/20',
      'focus-visible:ring-[#EF5350]',
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
        ? 'hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:-translate-y-0.5'
        : '',
    secondary:
      glow && !disabled
        ? 'hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:-translate-y-0.5'
        : '',
    ghost: '',
    danger:
      glow && !disabled
        ? 'hover:shadow-[0_8px_32px_rgba(0,0,0,0.24)] hover:-translate-y-0.5'
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
