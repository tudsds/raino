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
  const baseStyles = 'rounded-lg overflow-hidden';

  const variantStyles = {
    default: 'bg-[#111118] border border-[#27272a]',
    neon: 'bg-[#111118] border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]',
    dark: 'bg-[#0a0a0f] border border-[#1a1a24]',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
        <div>
          <h3 className="text-[#e4e4e7] font-medium">{title}</h3>
          {subtitle && <p className="text-[#71717a] text-sm mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
