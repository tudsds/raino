'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'neon' | 'dark';
}

export function Panel({
  title,
  subtitle,
  actions,
  variant = 'default',
  className,
  children,
  ...props
}: PanelProps) {
  const baseStyles = 'overflow-hidden';

  const variantStyles = {
    default: 'bg-[#111118] border-2 border-[#27272a]',
    neon: 'bg-[#111118] border-2 border-[#00f0ff] shadow-[0_0_0_2px_rgba(0,240,255,0.2),0_0_20px_rgba(0,240,255,0.1)]',
    dark: 'bg-[#0a0a0f] border-2 border-[#1a1a24]',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#27272a]">
        <div>
          <h3
            className="text-[#e4e4e7] font-[family-name:var(--font-heading)] uppercase tracking-wider"
            style={{ fontSize: '0.7rem' }}
          >
            {title}
          </h3>
          {subtitle && <p className="text-[#71717a] text-base mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
