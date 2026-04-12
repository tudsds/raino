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
      'w-full px-3 py-2 bg-[#0a0a0f] text-[#e4e4e7] placeholder-[#71717a] transition-all focus:outline-none font-[family-name:var(--font-body)] text-lg';

    const variantStyles = {
      default: ['border-2 border-[#27272a]', 'focus:border-[#3f3f46]', 'hover:border-[#3f3f46]'],
      neon: [
        'border-2 border-[#00f0ff]',
        'focus:border-[#00f0ff]',
        'focus:shadow-[0_0_0_2px_rgba(0,240,255,0.3),0_0_10px_rgba(0,240,255,0.2)]',
        'hover:border-[#00f0ff]',
      ],
    };

    const errorStyles = error
      ? 'border-[#ff3366] focus:border-[#ff3366] focus:shadow-[0_0_0_2px_rgba(255,51,102,0.3)]'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-base font-[family-name:var(--font-heading)] text-[#a1a1aa] mb-2 uppercase tracking-wider"
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
        {error && <p className="mt-2 text-base text-[#ff3366]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
