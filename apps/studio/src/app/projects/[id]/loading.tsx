import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 animate-pixel-pulse bg-[#1a1a2e]" />
            <div>
              <div className="h-6 w-48 animate-pixel-pulse bg-[#1a1a2e] mb-1" />
              <div className="h-3 w-32 animate-pixel-pulse bg-[#1a1a2e]" />
            </div>
          </div>
          <div className="h-6 w-20 animate-pixel-pulse bg-[#1a1a2e]" />
        </div>
      </header>

      <div className="border-b border-[#27273a] bg-[#111118]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 h-[49px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-full w-20 animate-pixel-pulse bg-[#1a1a2e] mx-1" />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
          <div className="space-y-6">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
        </div>
      </main>
    </div>
  );
}
