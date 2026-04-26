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
  const baseStyles = 'overflow-hidden rounded-2xl glass-elevated glass-specular';

  const variantStyles = {
    default: 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)]',
    neon: 'bg-white/[0.06] backdrop-blur-xl border border-[#1565C0]/30 shadow-[0_8px_32px_rgba(0,0,0,0.20)]',
    dark: 'bg-[#0A1929]/80 backdrop-blur-xl border border-white/[0.08]',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.12]">
        <div>
          <h3
            className="text-[#E2E8F0] font-[family-name:var(--font-heading)] uppercase tracking-wider"
            style={{ fontSize: '0.7rem' }}
          >
            {title}
          </h3>
          {subtitle && <p className="text-[#64748B] text-base mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
