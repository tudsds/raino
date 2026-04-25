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
      'w-full px-3 py-2 bg-white/[0.06] backdrop-blur-xl text-[#E2E8F0] border border-white/[0.12] transition-all duration-300 focus:outline-none focus:border-[#1565C0] hover:border-white/[0.20] appearance-none cursor-pointer font-[family-name:var(--font-body)] text-lg rounded-lg';

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
        <div className="relative">
          <select ref={ref} className={cn(baseStyles, errorStyles, className)} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0D2137]">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-[#64748B]"
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
        {error && <p className="mt-2 text-base text-[#EF5350]">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
