import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="h-10 w-64 animate-pixel-pulse bg-[#1a1a2e] mb-2" />
          <div className="h-6 w-96 animate-pixel-pulse bg-[#1a1a2e] mb-6" />
          <div className="h-12 w-40 animate-pixel-pulse bg-[#1a1a2e]" />
        </div>
        <LoadingSkeleton variant="project-grid" count={6} />
      </main>
    </div>
  );
}
