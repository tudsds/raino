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
      'w-full px-3 py-2 bg-[#0a0a0f] text-[#e4e4e7] placeholder-[#71717a] border-2 border-[#27272a] transition-all focus:outline-none focus:border-[#3f3f46] hover:border-[#3f3f46] resize-y min-h-[100px] font-[family-name:var(--font-body)] text-lg';

    const errorStyles = error ? 'border-[#ff3366] focus:border-[#ff3366]' : '';

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
        <textarea ref={ref} className={cn(baseStyles, errorStyles, className)} {...props} />
        {error && <p className="mt-2 text-base text-[#ff3366]">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
