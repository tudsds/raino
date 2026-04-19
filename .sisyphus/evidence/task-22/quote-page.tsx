import { prisma } from '@raino/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdapterStatus } from '@raino/supplier-clients';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import { DegradedModeBanner } from '@/components/DegradedModeBanner';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getArtifacts } from '@/lib/data/artifact-queries';
import QuoteActions from '@/components/QuoteActions';

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

function ConfidenceBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
    medium: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
    low: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
  };
  const styleClass = styles[level] ?? styles.medium;

  return (
    <span className={`px-3 py-1 text-xs font-medium border ${styleClass}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Confidence
    </span>
  );
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { quotes: { orderBy: { createdAt: 'desc' } } },
  });

  if (!project) {
    notFound();
  }

  const quoteRow = project.quotes[0];
  const breakdown = Array.isArray(quoteRow?.breakdown)
    ? (quoteRow.breakdown as Array<{ label: string; value: number }>)
    : [];
  const assumptions = Array.isArray(quoteRow?.assumptions)
    ? (quoteRow.assumptions as string[])
    : [];

  const user = await getCurrentUser();
  const userEmail = user?.email ?? '';

  const artifacts = await getArtifacts(id);
  const artifactOptions = artifacts.map((a) => {
    const url =
      a.storageBucket && a.storageKey && process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${a.storageBucket}/${a.storageKey}`
        : a.filePath;
    return {
      id: a.id,
      name: a.fileName,
      type: a.artifactType,
      url,
    };
  });

  const adapterStatus = getAdapterStatus();
  const statusEntries = [
    { name: 'DigiKey', ...adapterStatus.digikey },
    { name: 'Mouser', ...adapterStatus.mouser },
    { name: 'JLCPCB', ...adapterStatus.jlcpcb },
  ] as const;
  const mockSuppliers = statusEntries.filter((s) => s.mode === 'mock').map((s) => s.name);
  const liveSuppliers = statusEntries.filter((s) => s.mode === 'live').map((s) => s.name);

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote`, active: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${id}`}
              className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
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
              <h1 className="text-xl font-bold text-[#e4e4e7]">Rough Quote</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {quoteRow && <ConfidenceBadge level={quoteRow.confidence} />}
            <StatusBadge status={project.status as Status} />
          </div>
        </div>
      </header>

      <div className="border-b border-[#27273a] bg-[#13131f]/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#00f0ff] border-[#00f0ff]'
                    : 'text-[#a1a1aa] border-transparent hover:text-[#e4e4e7] hover:border-[#3a3a5a]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {mockSuppliers.length > 0 && (
          <DegradedModeBanner
            message={`Supplier pricing: ${liveSuppliers.join(', ') || 'none'} live; ${mockSuppliers.join(', ')} using fixture estimates.`}
            severity={mockSuppliers.length === 3 ? 'red' : 'amber'}
          />
        )}
        {!quoteRow ? (
          <div className="card p-8 text-center">
            <h2 className="text-lg font-semibold text-[#e4e4e7] mb-2">No Quote Generated</h2>
            <p className="text-[#64748b]">
              Complete the design workflow to generate a rough quote.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-8">
                <h2 className="text-lg font-semibold text-[#e4e4e7] mb-6">Price Estimate</h2>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-6 bg-[#1a1a2e] border border-[#27273a]">
                    <p className="text-sm text-[#64748b] mb-2">Low Estimate</p>
                    <p className="text-3xl font-bold text-[#22c55e] font-mono">
                      ${Number(quoteRow.lowQuote).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-b from-[#00f0ff]/10 to-[#8b5cf6]/10 border border-[#00f0ff]/30 neon-glow-cyan">
                    <p className="text-sm text-[#00f0ff] mb-2">Mid Estimate</p>
                    <p className="text-4xl font-bold gradient-text font-mono">
                      ${Number(quoteRow.midQuote).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-[#1a1a2e] border border-[#27273a]">
                    <p className="text-sm text-[#64748b] mb-2">High Estimate</p>
                    <p className="text-3xl font-bold text-[#f59e0b] font-mono">
                      ${Number(quoteRow.highQuote).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {breakdown.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-2 border-b border-[#27273a] last:border-0"
                    >
                      <span className="text-[#a1a1aa]">{item.label}</span>
                      <span className="text-[#e4e4e7] font-mono">
                        ${item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-[#27273a]">
                    <span className="text-lg font-semibold text-[#e4e4e7]">Mid Estimate Total</span>
                    <span className="text-2xl font-bold text-[#00f0ff] font-mono">
                      ${Number(quoteRow.midQuote).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Assumptions</h2>
                <ul className="space-y-2">
                  {assumptions.map((assumption, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-[#a1a1aa]">
                      <span className="text-[#00f0ff] mt-0.5">&#x2022;</span>
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <QuoteActions
                projectId={id}
                defaultEmail={userEmail}
                artifacts={artifactOptions}
              />

              <div className="card p-6">
                <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                  Quote Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Confidence</span>
                    <ConfidenceBadge level={quoteRow.confidence} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Quote ID</span>
                    <span className="text-[#e4e4e7] font-mono">{quoteRow.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Generated</span>
                    <span className="text-[#e4e4e7]">
                      {new Date(quoteRow.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Quantity</span>
                    <span className="text-[#e4e4e7]">{quoteRow.quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
