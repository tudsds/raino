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
      'w-full px-3 py-2 bg-[#0a0a0f] text-[#e4e4e7] placeholder-[#71717a] rounded-md transition-all duration-200 focus:outline-none';

    const variantStyles = {
      default: ['border border-[#27272a]', 'focus:border-[#3f3f46]', 'hover:border-[#3f3f46]'],
      neon: [
        'border border-[#00f0ff]/50',
        'focus:border-[#00f0ff]',
        'focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]',
        'hover:border-[#00f0ff]/70',
      ],
    };

    const errorStyles = error
      ? 'border-[#ff3366] focus:border-[#ff3366] focus:ring-1 focus:ring-[#ff3366]'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(baseStyles, variantStyles[variant], errorStyles, className)}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[#ff3366]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
