import Link from 'next/link';

interface DegradedModePageProps {
  title: string;
  description: string;
  projectId?: string;
  stepHint?: string;
}

export function DegradedModePage({
  title,
  description,
  projectId,
  stepHint,
}: DegradedModePageProps) {
  return (
    <div className="min-h-screen bg-[#0A1929]">
      <header className="border-b border-white/[0.12] bg-[#0A1929]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          {projectId && (
            <Link
              href={`/projects/${projectId}`}
              className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">{title}</h1>
            {projectId && (
              <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">
                {projectId}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-surface p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 glass-blue-tint flex items-center justify-center rounded-full">
            <svg
              className="w-8 h-8 text-[#6191D3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#E2E8F0] mb-3">Database Unavailable</h2>
          <p className="text-[#94A3B8] mb-4">{description}</p>
          {stepHint && (
            <p className="text-sm text-[#64748b] mt-4 p-3 glass-surface rounded-lg inline-block">
              {stepHint}
            </p>
          )}
          <div className="mt-6 p-4 glass-elevated rounded-lg text-left">
            <p className="text-xs text-[#64748b] mb-2 uppercase tracking-wider">To enable full functionality:</p>
            <ol className="text-sm text-[#94A3B8] space-y-1 list-decimal list-inside">
              <li>Add <code className="text-[#6191D3] font-mono">NEXT_PUBLIC_SUPABASE_URL</code> to your environment</li>
              <li>Add <code className="text-[#6191D3] font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to your environment</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}