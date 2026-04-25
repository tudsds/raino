'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4">
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl mb-8">
          <span className="text-3xl text-[#1565C0] font-bold">
            404
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] mb-4 leading-relaxed">
          Page Not Found
        </h1>
        <p className="text-lg text-[#94A3B8] mb-10">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
        >
          <span>←</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
