import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';

interface ArchitecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchitecturePage({ params }: ArchitecturePageProps) {
  const { id } = await params;
  const db = getSupabaseAdmin();

  const { data: project } = await db
    .from('projects')
    .select('*, architecture:architectures(*)')
    .eq('id', id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const architecture = project.architecture ?? null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/projects/${id}`} className="text-[#71717a] hover:text-[#a1a1aa] transition-colors text-sm">
            ← Back to Project
          </Link>
          <span className="text-[#27273a]">/</span>
          <span className="text-[#a1a1aa] text-sm">Architecture</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#e4e4e7] mb-2 font-[family-name:var(--font-heading)]">
              Architecture Plan
            </h1>
            <p className="text-[#a1a1aa] font-[family-name:var(--font-body)]">
              {project.name}
            </p>
          </div>
          <StatusBadge status={project.status as Status} />
        </div>

        {!architecture ? (
          <div className="card p-8 text-center">
            <p className="text-[#a1a1aa] mb-4">No architecture plan generated yet.</p>
            <p className="text-sm text-[#71717a]">
              Complete the intake and spec compilation steps first, then trigger architecture planning.
            </p>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#e4e4e7] mb-4 font-[family-name:var(--font-heading)]">
              {architecture.template_name ?? 'AI Recommended Architecture'}
            </h2>
            {architecture.rationale && (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-[#a1a1aa] font-[family-name:var(--font-body)]">
                  {architecture.rationale}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
