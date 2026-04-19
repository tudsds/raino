'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0f] circuit-grid px-4">
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#111118] border-2 border-[#ff3366] mb-8">
          <span className="text-3xl text-[#ff3366] font-[family-name:var(--font-heading)]">!</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#e4e4e7] mb-4 font-[family-name:var(--font-heading)] leading-relaxed">
          Something Went Wrong
        </h1>
        <p className="text-lg text-[#a1a1aa] mb-4 font-[family-name:var(--font-body)]">
          An unexpected error occurred while loading this page.
        </p>
        {error.message && (
          <div className="mb-8 px-4 py-3 bg-[#111118] border-2 border-[#27272a] text-left">
            <p className="text-sm text-[#71717a] font-[family-name:var(--font-body)] break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-[#71717a] font-[family-name:var(--font-body)] mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-8 py-4 bg-[#00f0ff] text-[#0a0a0f] font-[family-name:var(--font-body)] text-lg font-semibold hover:neon-glow transition-all duration-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#111118] border-2 border-[#27272a] text-[#e4e4e7] font-[family-name:var(--font-body)] text-lg hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all duration-300"
          >
            <span>←</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
