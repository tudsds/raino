'use client';

interface LoadingSkeletonProps {
  variant?: 'card' | 'row' | 'table' | 'text' | 'project-grid';
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  variant = 'card',
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  const shimmer = 'animate-pixel-pulse bg-[#1a1a2e]';

  if (variant === 'card') {
    return (
      <div className={`card p-6 ${className}`}>
        <div className={`h-6 w-1/3 ${shimmer} mb-4`} />
        <div className={`h-4 w-2/3 ${shimmer} mb-2`} />
        <div className={`h-4 w-1/2 ${shimmer}`} />
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={`flex items-center gap-4 p-4 ${className}`}>
        <div className={`w-10 h-10 ${shimmer}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-1/4 ${shimmer}`} />
          <div className={`h-3 w-1/3 ${shimmer}`} />
        </div>
        <div className={`h-8 w-24 ${shimmer}`} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`h-10 ${shimmer}`} />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`h-12 ${shimmer}`} />
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`h-4 ${shimmer}`}
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'project-grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${shimmer}`} />
              <div className={`h-6 w-20 ${shimmer}`} />
            </div>
            <div className={`h-5 w-3/4 ${shimmer} mb-2`} />
            <div className={`h-4 w-full ${shimmer} mb-2`} />
            <div className={`h-4 w-2/3 ${shimmer} mb-4`} />
            <div className={`h-3 w-full ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
