'use client';

export interface CircuitGridProps {
  opacity?: number;
  color?: string;
}

export function CircuitGrid({ opacity = 0.03, color = '#00f0ff' }: CircuitGridProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
        <defs>
          <pattern
            id="circuit-pattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 50 H40 M60 50 H100 M50 0 V40 M50 60 V100"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
            <circle cx="20" cy="50" r="2" fill="currentColor" />
            <circle cx="80" cy="50" r="2" fill="currentColor" />
            <circle cx="50" cy="20" r="2" fill="currentColor" />
            <circle cx="50" cy="80" r="2" fill="currentColor" />
            <path
              d="M20 50 L20 30 M80 50 L80 70 M50 20 L70 20 M50 80 L30 80"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      </svg>
    </div>
  );
}
