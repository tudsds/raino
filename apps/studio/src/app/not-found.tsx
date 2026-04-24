'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0f] circuit-grid px-4">
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#111118] border-2 border-[#27272a] mb-8">
          <span className="text-3xl text-[#00f0ff] font-[family-name:var(--font-heading)]">
            404
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#e4e4e7] mb-4 font-[family-name:var(--font-heading)] leading-relaxed">
          Page Not Found
        </h1>
        <p className="text-lg text-[#a1a1aa] mb-10 font-[family-name:var(--font-body)]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#111118] border-2 border-[#27272a] text-[#e4e4e7] font-[family-name:var(--font-body)] text-lg hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all duration-300"
        >
          <span>←</span>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
