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
    cyan: 'rgba(0, 240, 255,',
    purple: 'rgba(139, 92, 246,',
    magenta: 'rgba(255, 0, 170,',
  };

  const intensityMap = {
    low: 0.2,
    medium: 0.4,
    high: 0.6,
  };

  const alpha = intensityMap[intensity];
  const color = colorMap[glowColor];

  return (
    <div
      className={cn('relative bg-[#111118] rounded-lg overflow-hidden', className)}
      style={{
        boxShadow: `
          0 0 20px ${color} ${alpha * 0.5}),
          0 0 40px ${color} ${alpha * 0.3}),
          0 0 60px ${color} ${alpha * 0.2}),
          inset 0 0 20px ${color} ${alpha * 0.1})
        `,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color} 0.05) 0%, transparent 50%, ${color} 0.05) 100%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
