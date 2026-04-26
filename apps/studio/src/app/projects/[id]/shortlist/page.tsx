import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import ShortlistPageClient from './ShortlistPageClient';
import { DegradedModePage } from '@/components/DegradedModePage';

interface ShortlistPageProps {
  params: Promise<{ id: string }>;
}

interface CandidateFamily {
  family: string;
  manufacturer: string;
  mpns: string[];
  documentTypes?: string[];
}

export default async function ShortlistPage({ params }: ShortlistPageProps) {
  const { id } = await params;

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hasSupabase) {
    return (
      <DegradedModePage
        title="Candidate Shortlist"
        description="Supabase credentials are not configured. The shortlist requires a database connection."
        projectId={id}
        stepHint="Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable part shortlisting."
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

  const { data: manifest } = await db
    .from('ingestion_manifests')
    .select('*')
    .eq('project_id', id)
    .maybeSingle();

  const candidates: CandidateFamily[] = Array.isArray(manifest?.candidate_families)
    ? (manifest.candidate_families as unknown as CandidateFamily[])
    : [];

  const grouped = candidates.reduce<Record<string, CandidateFamily[]>>((acc, c) => {
    const key = c.family || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);
  const isPromoted = manifest?.status === 'completed';
  const currentStep = project.current_step ?? 4;
  const progressPct = Math.round((currentStep / 12) * 100);

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'shortlist', label: 'Shortlist', href: `/projects/${id}/shortlist`, active: true },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'design', label: 'Design', href: `/projects/${id}/design` },
    { id: 'validate', label: 'Validate', href: `/projects/${id}/validate` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

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
              <h1 className="text-xl font-bold text-[#E2E8F0]">Candidate Shortlist</h1>
              <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={project.status as Status} />
          </div>
        </div>
      </header>

      <div className="border-b border-white/[0.12] bg-[#132F4C]/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#1565C0] border-[#1565C0]'
                    : 'text-[#94A3B8] border-transparent hover:text-[#E2E8F0] hover:border-white/[0.12]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass-surface p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#E2E8F0] font-[family-name:var(--font-body)]">
              Step 4 of 12
            </span>
            <span className="text-sm text-[#94A3B8]">Candidate Shortlist</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1565C0] rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="glass-surface p-8 text-center">
            <h2 className="text-lg font-semibold text-[#E2E8F0] mb-2">No Candidates Yet</h2>
            <p className="text-[#64748b] mb-4">
              Candidate parts will appear here after the architecture planning stage discovers suitable component families.
            </p>
            <p className="text-sm text-[#64748B]">
              Complete the architecture step to generate a candidate shortlist.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#E2E8F0]">Shortlisted Parts</h2>
                <p className="text-sm text-[#64748b]">
                  {candidates.length} candidate {candidates.length === 1 ? 'family' : 'families'} across{' '}
                  {groupEntries.length} {groupEntries.length === 1 ? 'type' : 'types'}
                </p>
              </div>
              <ShortlistPageClient projectId={id} promoted={isPromoted} />
            </div>

            <div className="space-y-4">
              {groupEntries.map(([family, familyCandidates]) => (
                <div key={family} className="glass-elevated overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.12] bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#E2E8F0] font-[family-name:var(--font-body)]">
                        {family}
                      </h3>
                      <span className="text-xs text-[#64748B]">
                        {familyCandidates.length} {familyCandidates.length === 1 ? 'candidate' : 'candidates'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {familyCandidates.map((candidate) => (
                      <div
                        key={`${candidate.manufacturer}-${candidate.mpns[0]}`}
                        className="glass-surface p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#E2E8F0] font-[family-name:var(--font-body)] truncate">
                              {candidate.family}
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{candidate.manufacturer}</p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md whitespace-nowrap ${
                              isPromoted
                                ? 'glass-blue-tint text-[#6191D3]'
                                : 'glass-surface text-[#94A3B8]'
                            }`}
                          >
                            {isPromoted ? 'Promoted' : 'Pending'}
                          </span>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-[#64748B] mb-1.5">MPNs</p>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.mpns.map((mpn) => (
                              <span
                                key={mpn}
                                className="inline-flex items-center px-2 py-0.5 text-xs font-[family-name:var(--font-body)] text-[#94A3B8] glass-surface rounded"
                              >
                                {mpn}
                              </span>
                            ))}
                          </div>
                        </div>

                        {candidate.documentTypes && candidate.documentTypes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/[0.06]">
                            <p className="text-xs text-[#64748B] mb-1">Documents</p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.documentTypes.map((docType) => (
                                <span
                                  key={docType}
                                  className="text-xs text-[#94A3B8] px-1.5 py-0.5 rounded bg-white/[0.04]"
                                >
                                  {docType.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
