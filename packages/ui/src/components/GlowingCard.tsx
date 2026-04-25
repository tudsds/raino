'use client';

import React from 'react';
import { cn } from '../styles/cn';

export interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'cyan' | 'purple' | 'magenta';
  intensity?: 'low' | 'medium' | 'high';
}

/** @deprecated Use GlassCard instead */
export function GlowingCard({
  glowColor = 'cyan',
  intensity = 'medium',
  className,
  children,
  ...props
}: GlowingCardProps) {
  const colorMap = {
    cyan: '#1565C0',
    purple: '#6191D3',
    magenta: '#1565C0',
  };

  const intensityMap = {
    low: 0.15,
    medium: 0.25,
    high: 0.4,
  };

  const alpha = intensityMap[intensity];
  const color = colorMap[glowColor];

  return (
    <div
      className={cn(
        'relative bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl overflow-hidden',
        className,
      )}
      style={{
        borderColor: `${color}${Math.round(alpha * 255)
          .toString(16)
          .padStart(2, '0')}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.20)`,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')} 0%, transparent 50%, ${color}${Math.round((alpha * 0.5) * 255)
            .toString(16)
            .padStart(2, '0')} 100%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export const GlassCard = GlowingCard;
