'use client';

import React from 'react';
import { cn } from '../../styles/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tint?: 'default' | 'accent' | 'external';
  enableNoise?: boolean;
  enableSpecular?: boolean;
  glassIntensity?: 'surface' | 'elevated' | 'floating';
}

export function GlassCard({
  children,
  className = '',
  tint = 'default',
  enableNoise = true,
  enableSpecular = true,
  glassIntensity = 'surface',
  ...props
}: GlassCardProps) {
  const tintClasses = {
    default: '',
    accent: 'glass-blue-tint',
    external: '',
  };

  const glassClasses = {
    surface: cn('glass-surface', enableNoise && 'glass-noise', enableSpecular && 'glass-specular'),
    elevated: cn('glass-elevated', enableNoise && 'glass-noise', enableSpecular && 'glass-specular'),
    floating: cn('glass-floating', enableNoise && 'glass-noise', enableSpecular && 'glass-specular'),
  };

  const externalStyles =
    tint === 'external'
      ? {
          background: 'rgba(100, 116, 139, 0.06)',
          borderColor: 'rgba(100, 116, 139, 0.15)',
        }
      : {};

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden',
        glassClasses[glassIntensity],
        tintClasses[tint],
        className,
      )}
      style={externalStyles}
      {...props}
    >
      {children}
    </div>
  );
}
