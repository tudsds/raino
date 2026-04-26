'use client';

import { LazyMotion, domAnimation, m, useReducedMotion, type Transition } from 'motion/react';
import { Card, type CardProps } from './Card';

export interface LiquidGlassCardProps extends CardProps {
  springConfig?: 'snappy' | 'smooth' | 'gentle';
}

const springPresets: Record<string, Transition> = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  smooth: { type: 'spring', stiffness: 200, damping: 25, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 150, damping: 28 },
};

export function LiquidGlassCard({
  springConfig = 'smooth',
  children,
  ...cardProps
}: LiquidGlassCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const spring = springPresets[springConfig];

  if (shouldReduceMotion) {
    return (
      <LazyMotion features={domAnimation}>
        <m.div>
          <Card {...cardProps}>{children}</Card>
        </m.div>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={spring}
      >
        <Card {...cardProps}>{children}</Card>
      </m.div>
    </LazyMotion>
  );
}
