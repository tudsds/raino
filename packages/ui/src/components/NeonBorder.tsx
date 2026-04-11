'use client';

import { useEffect, useState } from 'react';
import { cn } from '../styles/cn';

export interface NeonBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'cyan' | 'purple' | 'magenta';
  animated?: boolean;
  thickness?: number;
}

export function NeonBorder({
  color = 'cyan',
  animated = false,
  thickness = 2,
  className,
  children,
  ...props
}: NeonBorderProps) {
  const colorMap = {
    cyan: {
      border: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.5)',
    },
    purple: {
      border: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.5)',
    },
    magenta: {
      border: '#ff00aa',
      glow: 'rgba(255, 0, 170, 0.5)',
    },
  };

  const colors = colorMap[color];
  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  useEffect(() => {
    if (!animated) return;

    let direction = 1;
    const interval = setInterval(() => {
      setPulseIntensity((prev) => {
        const next = prev + direction * 0.1;
        if (next >= 1) {
          direction = -1;
          return 1;
        }
        if (next <= 0.3) {
          direction = 1;
          return 0.3;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div
      className={cn('relative', className)}
      style={{
        border: `${thickness}px solid ${colors.border}`,
        boxShadow: animated
          ? `0 0 ${10 * pulseIntensity}px ${colors.glow}, 0 0 ${20 * pulseIntensity}px ${colors.glow}, inset 0 0 ${10 * pulseIntensity}px ${colors.glow}`
          : `0 0 10px ${colors.glow}`,
        transition: animated ? 'box-shadow 0.1s ease-out' : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
