'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 bg-white/[0.06] backdrop-blur-xl text-[#E2E8F0] placeholder-[#64748B] border border-white/[0.12] transition-all duration-300 focus:outline-none focus:border-[#1565C0] hover:border-white/[0.20] resize-y min-h-[100px] font-[family-name:var(--font-body)] text-lg rounded-lg';

    const errorStyles = error ? 'border-[#EF5350] focus:border-[#EF5350]' : '';

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
        <textarea ref={ref} className={cn(baseStyles, errorStyles, className)} {...props} />
        {error && <p className="mt-2 text-base text-[#EF5350]">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
