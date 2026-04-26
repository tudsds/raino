import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import DesignPageClient from './DesignPageClient';
import { DegradedModePage } from '@/components/DegradedModePage';

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { id } = await params;

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hasSupabase) {
    return (
      <DegradedModePage
        title="Design Generation"
        description="Supabase credentials are not configured. Design generation requires a database connection."
        projectId={id}
        stepHint="Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable design generation."
      />
    );
  }

  const db = getSupabaseAdmin();

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: designJob } = await db
    .from('design_jobs')
    .select('*')
    .eq('project_id', id)
    .eq('job_type', 'DESIGN')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasBOM = !!(project as Record<string, unknown>).bom;
  const jobStatus = (designJob as Record<string, unknown> | null)?.status as string | undefined;

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <header className="border-b border-white/[0.12] bg-[#0A1929]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${id}`}
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
            <div>
              <h1 className="text-xl font-bold text-[#E2E8F0]">Design Generation</h1>
              <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">{id}</p>
            </div>
          </div>
          <StatusBadge status={project.status as Status} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">KiCad Design Generation</h2>
          <p className="text-[#94A3B8]">
            Generate schematic and PCB layout files via KiCad CLI through GitHub Actions.
          </p>
        </div>

        <div className="glass-surface p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#E2E8F0] mb-4">Prerequisites</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasBOM ? 'bg-[#4CAF50]' : 'bg-[#EF5350]'}`} />
              <span className="text-sm text-[#94A3B8]">
                BOM Generated {hasBOM ? '(✓)' : '(Required — generate BOM first)'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${project.status === 'architecture_planned' || project.status === 'bom_generated' || project.status === 'design_running' || project.status === 'validated' ? 'bg-[#4CAF50]' : 'bg-[#64748B]'}`} />
              <span className="text-sm text-[#94A3B8]">
                Architecture Planned {project.status === 'architecture_planned' || project.status === 'bom_generated' || project.status === 'design_running' || project.status === 'validated' ? '(✓)' : '(Pending)'}
              </span>
            </div>
          </div>
        </div>

        <DesignPageClient
          params={params}
          hasBOM={hasBOM}
          initialJobStatus={jobStatus ?? null}
        />

        {designJob && (
          <div className="mt-6 glass-elevated glass-specular p-6">
            <h3 className="text-lg font-semibold text-[#E2E8F0] mb-4">Job Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-surface p-3">
                <p className="text-xs text-[#64748B] mb-1">Job ID</p>
                <p className="text-sm text-[#94A3B8] font-[family-name:var(--font-body)]">{(designJob as Record<string, unknown>).id as string}</p>
              </div>
              <div className="glass-surface p-3">
                <p className="text-xs text-[#64748B] mb-1">Status</p>
                <p className="text-sm text-[#E2E8F0] capitalize">{(designJob as Record<string, unknown>).status as string}</p>
              </div>
              <div className="glass-surface p-3">
                <p className="text-xs text-[#64748B] mb-1">Progress</p>
                <p className="text-sm text-[#E2E8F0]">{Number((designJob as Record<string, unknown>).progress) * 100}%</p>
              </div>
              <div className="glass-surface p-3">
                <p className="text-xs text-[#64748B] mb-1">Created</p>
                <p className="text-sm text-[#94A3B8]">{new Date((designJob as Record<string, unknown>).created_at as string).toLocaleString()}</p>
              </div>
            </div>
            {!!(designJob as Record<string, unknown>).error && (
              <div className="mt-4 p-3 glass-surface border border-[#EF5350]/30">
                <p className="text-sm text-[#EF5350]">{(designJob as Record<string, unknown>).error as string}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
