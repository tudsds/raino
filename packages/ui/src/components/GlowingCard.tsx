'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'cyan' | 'purple' | 'magenta';
  intensity?: 'low' | 'medium' | 'high';
}

export function GlowingCard({
  glowColor = 'cyan',
  intensity = 'medium',
  className,
  children,
  ...props
}: GlowingCardProps) {
  const colorMap = {
    cyan: '#00f0ff',
    purple: '#8b5cf6',
    magenta: '#ff00aa',
  };

  const intensityMap = {
    low: 0.3,
    medium: 0.5,
    high: 0.8,
  };

  const alpha = intensityMap[intensity];
  const color = colorMap[glowColor];

  return (
    <div
      className={cn('relative bg-[#111118] overflow-hidden', className)}
      style={{
        border: `2px solid ${color}`,
        boxShadow: `
          0 0 0 2px ${color}${Math.round(alpha * 40)
            .toString(16)
            .padStart(2, '0')},
          0 0 10px ${color}${Math.round(alpha * 80)
            .toString(16)
            .padStart(2, '0')}
        `,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color}${Math.round(alpha * 20)
            .toString(16)
            .padStart(2, '0')} 0%, transparent 50%, ${color}${Math.round(alpha * 10)
            .toString(16)
            .padStart(2, '0')} 100%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
