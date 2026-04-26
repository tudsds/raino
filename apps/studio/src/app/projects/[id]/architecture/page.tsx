import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import ArchitecturePageClient from './ArchitecturePageClient';

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

  const architectures = project.architecture ?? [];
  const architecture = Array.isArray(architectures)
    ? (architectures[0] ?? null)
    : architectures;

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/projects/${id}`} className="text-[#64748B] hover:text-[#94A3B8] transition-colors text-sm">
            ← Back to Project
          </Link>
          <span className="text-[#1E3A5F]">/</span>
          <span className="text-[#94A3B8] text-sm">Architecture</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2 font-[family-name:var(--font-heading)]">
              Architecture Plan
            </h1>
            <p className="text-[#94A3B8] font-[family-name:var(--font-body)]">
              {project.name}
            </p>
          </div>
          <StatusBadge status={project.status as Status} />
        </div>

        {!architecture ? (
          <div className="glass-elevated p-8 text-center">
            <p className="text-[#94A3B8] mb-4">No architecture plan generated yet.</p>
            <p className="text-sm text-[#64748B] mb-4">
              Trigger architecture planning to generate an AI-recommended architecture.
            </p>
            <ArchitecturePageClient params={params} hasArchitecture={false} />
          </div>
        ) : (
          <div className="glass-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#E2E8F0] font-[family-name:var(--font-heading)]">
                {architecture.template_name ?? 'AI Recommended Architecture'}
              </h2>
              <ArchitecturePageClient params={params} hasArchitecture={true} />
            </div>
            {architecture.rationale && (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-[#94A3B8] font-[family-name:var(--font-body)]">
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
