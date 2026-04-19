'use client';

import { useState } from 'react';

export interface DegradedModeBannerProps {
  message: string;
  severity?: 'amber' | 'red';
}

export function DegradedModeBanner({ message, severity = 'amber' }: DegradedModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const colors = {
    amber: {
      border: '#ffaa00',
      glow: 'rgba(255, 170, 0, 0.6)',
      bg: 'rgba(255, 170, 0, 0.08)',
      text: '#ffaa00',
      icon: '#ffaa00',
    },
    red: {
      border: '#ff3366',
      glow: 'rgba(255, 51, 102, 0.6)',
      bg: 'rgba(255, 51, 102, 0.08)',
      text: '#ff3366',
      icon: '#ff3366',
    },
  };

  const c = colors[severity];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 mb-6"
      style={{
        backgroundColor: c.bg,
        border: `2px solid ${c.border}`,
        boxShadow: `0 0 8px ${c.glow}`,
      }}
    >
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="none"
        stroke={c.icon}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p
        className="flex-1 text-sm font-[family-name:var(--font-body)] leading-relaxed"
        style={{ color: c.text }}
      >
        {message}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 hover:opacity-80 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke={c.icon} viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
