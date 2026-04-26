import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import ValidatePageClient from './ValidatePageClient';
import { DegradedModePage } from '@/components/DegradedModePage';

interface ValidatePageProps {
  params: Promise<{ id: string }>;
}

function ResultBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium glass-surface ${
        passed ? 'text-[#4CAF50]' : 'text-[#EF5350]'
      }`}
    >
      {passed ? 'PASS' : 'FAIL'}
    </span>
  );
}

export default async function ValidatePage({ params }: ValidatePageProps) {
  const { id } = await params;

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hasSupabase) {
    return (
      <DegradedModePage
        title="Validation"
        description="Supabase credentials are not configured. Validation requires a database connection."
        projectId={id}
        stepHint="Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable validation."
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

  const { data: validationJob } = await db
    .from('design_jobs')
    .select('*')
    .eq('project_id', id)
    .eq('job_type', 'VALIDATION')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isDesignComplete = ['design_running', 'validated', 'completed', 'quoted'].includes(project.status);

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
              <h1 className="text-xl font-bold text-[#E2E8F0]">Validation</h1>
              <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">{id}</p>
            </div>
          </div>
          <StatusBadge status={project.status as Status} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#E2E8F0] mb-2">ERC/DRC Validation</h2>
          <p className="text-[#94A3B8]">
            Run Electrical Rule Checks and Design Rule Checks on the generated KiCad design.
          </p>
        </div>

        <div className="glass-surface p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#E2E8F0] mb-4">Prerequisites</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isDesignComplete ? 'bg-[#4CAF50]' : 'bg-[#64748B]'}`} />
              <span className="text-sm text-[#94A3B8]">
                Design Generated {isDesignComplete ? '(✓)' : '(Required — generate design first)'}
              </span>
            </div>
          </div>
        </div>

        <ValidatePageClient
          params={params}
          isDesignComplete={isDesignComplete}
          initialValidation={validationJob ? {
            status: (validationJob as Record<string, unknown>).status as string,
            result: (validationJob as Record<string, unknown>).result as Record<string, unknown> | null,
          } : null}
        />

        {validationJob && !!(validationJob as Record<string, unknown>).result && (
          <div className="mt-6 glass-elevated glass-specular p-6">
            <h3 className="text-lg font-semibold text-[#E2E8F0] mb-4">Validation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const result = (validationJob as Record<string, unknown>).result as Record<string, unknown> | null;
                if (!result) return null;
                const entries = Object.entries(result);
                return entries.map(([key, value]) => {
                  const isPass = typeof value === 'boolean' ? value :
                    (typeof value === 'object' && value !== null && 'passed' in value) ? (value as { passed: boolean }).passed :
                    typeof value === 'number' ? value === 0 :
                    true;
                  return (
                    <div key={key} className="glass-surface p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#64748B] uppercase tracking-wider">{key}</p>
                        <ResultBadge passed={isPass} />
                      </div>
                      <pre className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
