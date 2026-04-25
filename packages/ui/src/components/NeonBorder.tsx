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
  thickness = 1,
  className,
  children,
  ...props
}: NeonBorderProps) {
  const colorMap = {
    cyan: {
      border: 'rgba(255, 255, 255, 0.20)',
      accent: '#1565C0',
    },
    purple: {
      border: 'rgba(255, 255, 255, 0.20)',
      accent: '#6191D3',
    },
    magenta: {
      border: 'rgba(255, 255, 255, 0.20)',
      accent: '#1565C0',
    },
  };

  const colors = colorMap[color];
  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  useEffect(() => {
    if (!animated) return;

    let direction = 1;
    const interval = setInterval(() => {
      setPulseIntensity((prev) => {
        const next = prev + direction * 0.05;
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
    }, 150);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div
      className={cn(
        'relative bg-white/[0.06] backdrop-blur-xl rounded-xl',
        className,
      )}
      style={{
        border: `${thickness}px solid ${colors.border}`,
        boxShadow: animated
          ? `0 8px 32px rgba(0, 0, 0, ${0.15 + 0.1 * pulseIntensity})`
          : `0 8px 32px rgba(0, 0, 0, 0.20)`,
        transition: animated ? 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      }}
      {...props}
    >
      {animated && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            border: `1px solid ${colors.accent}${Math.round(pulseIntensity * 40)
              .toString(16)
              .padStart(2, '0')}`,
            transition: 'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}
      {children}
    </div>
  );
}
