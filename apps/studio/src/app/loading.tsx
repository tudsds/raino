import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function DashboardLoading() {
 return (
 <div className="min-h-screen bg-[#0A1929]">
 <main className="max-w-7xl mx-auto px-6 py-8">
 <div className="mb-10">
 <div className="h-10 w-64 animate-pulse bg-[#132F4C] mb-2" />
 <div className="h-6 w-96 animate-pulse bg-[#132F4C] mb-6" />
 <div className="h-12 w-40 animate-pulse bg-[#132F4C]" />
 </div>
 <LoadingSkeleton variant="project-grid" count={6} />
 </main>
 </div>
 );
}
