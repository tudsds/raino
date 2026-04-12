'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 bg-[#0a0a0f] text-[#e4e4e7] border-2 border-[#27272a] transition-all focus:outline-none focus:border-[#3f3f46] hover:border-[#3f3f46] appearance-none cursor-pointer font-[family-name:var(--font-body)] text-lg';

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
        <div className="relative">
          <select ref={ref} className={cn(baseStyles, errorStyles, className)} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#111118]">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-[#71717a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && <p className="mt-2 text-base text-[#ff3366]">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
