'use client';

export interface CircuitGridProps {
  opacity?: number;
  color?: string;
}

export function CircuitGrid({ opacity = 0.05, color = '#00f0ff' }: CircuitGridProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color, imageRendering: 'pixelated' }}
      >
        <defs>
          <pattern
            id="circuit-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/*
            Pixel-art circuit pattern with sharp 90° angles only
            */}
            <path
              d="M0 40 H32 M48 40 H80 M40 0 V32 M40 48 V80"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <rect x="38" y="38" width="4" height="4" fill="currentColor" />
            <rect x="16" y="38" width="3" height="3" fill="currentColor" />
            <rect x="62" y="38" width="3" height="3" fill="currentColor" />
            <rect x="38" y="16" width="3" height="3" fill="currentColor" />
            <rect x="38" y="62" width="3" height="3" fill="currentColor" />
            <path
              d="M16 40 L16 24 M64 40 L64 56 M40 16 L56 16 M40 64 L24 64"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      </svg>
    </div>
  );
}
