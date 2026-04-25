'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'neon';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'default', className, ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 bg-white/[0.06] backdrop-blur-xl text-[#E2E8F0] placeholder-[#64748B] transition-all duration-300 focus:outline-none font-[family-name:var(--font-body)] text-lg rounded-lg';

    const variantStyles = {
      default: ['border border-white/[0.12]', 'focus:border-[#1565C0]', 'hover:border-white/[0.20]'],
      neon: [
        'border border-[#1565C0]/50',
        'focus:border-[#1565C0]',
        'focus:shadow-[0_0_0_3px_rgba(21,101,192,0.15)]',
        'hover:border-[#1565C0]/70',
      ],
    };

    const errorStyles = error
      ? 'border-[#EF5350] focus:border-[#EF5350] focus:shadow-[0_0_0_3px_rgba(239,83,80,0.15)]'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-base font-[family-name:var(--font-heading)] text-[#94A3B8] mb-2 uppercase tracking-wider"
            style={{ fontSize: '0.6rem' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(baseStyles, variantStyles[variant], errorStyles, className)}
          {...props}
        />
        {error && <p className="mt-2 text-base text-[#EF5350]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
