'use client';

export interface CircuitGridProps {
  opacity?: number;
  color?: string;
}

export function CircuitGrid({ opacity = 0.05 }: CircuitGridProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity }}
    >
      <div
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.08) 0%, transparent 50%, rgba(97, 145, 211, 0.05) 100%)',
          animation: 'gradient-shift 20s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background: linear-gradient(135deg, rgba(21, 101, 192, 0.08) 0%, transparent 50%, rgba(97, 145, 211, 0.05) 100%);
          }
          50% {
            background: linear-gradient(225deg, rgba(21, 101, 192, 0.08) 0%, transparent 50%, rgba(97, 145, 211, 0.05) 100%);
          }
        }
      `}</style>
    </div>
  );
}
