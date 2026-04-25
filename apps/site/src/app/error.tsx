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
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4">
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.06] backdrop-blur-xl border border-[#EF5350] rounded-xl mb-8">
          <span className="text-3xl text-[#EF5350] font-bold">!</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] mb-4 leading-relaxed">
          Something Went Wrong
        </h1>
        <p className="text-lg text-[#94A3B8] mb-4">
          An unexpected error occurred while loading this page.
        </p>
        {error.message && (
          <div className="mb-8 px-4 py-3 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl text-left">
            <p className="text-sm text-[#64748B] break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-[#64748B] mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
          >
            <span>←</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
