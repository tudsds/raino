'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    const baseStyles = [
      'w-full px-3 py-2 text-[#E2E8F0] placeholder-[#64748B] transition-all duration-300',
      'bg-[rgba(10,25,41,0.6)] backdrop-blur-[16px] backdrop-saturate-[160%]',
      'border border-[rgba(97,145,211,0.25)] border-t-white/20',
      'shadow-[0_1px_2px_rgba(10,25,41,0.4),0_4px_12px_rgba(10,25,41,0.3),inset_0_1px_2px_rgba(0,0,0,0.1)]',
      'font-[family-name:var(--font-body)] text-lg rounded-lg',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1929] focus-visible:ring-[rgba(97,145,211,0.8)]',
      'focus:border-[#1565C0] hover:border-white/[0.20] resize-y min-h-[100px]',
    ];

    const errorStyles = error
      ? 'border-[#EF5350] focus:border-[#EF5350] focus-visible:ring-[#EF5350]'
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
        <textarea ref={ref} className={cn(baseStyles, errorStyles, className)} {...props} />
        {error && <p className="mt-2 text-base text-[#EF5350]">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
