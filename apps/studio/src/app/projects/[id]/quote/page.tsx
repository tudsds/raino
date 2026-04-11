import { mockQuote, mockProjects } from '@/lib/mock-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import NeonButton from '@/components/NeonButton';

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
    medium: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
    low: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Confidence
    </span>
  );
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const quote = mockQuote;

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
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
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
            <ConfidenceBadge level={quote.confidence} />
            <StatusBadge status={project.status} />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-8">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-6">Price Estimate</h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-6 rounded-xl bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-sm text-[#64748b] mb-2">Low Estimate</p>
                  <p className="text-3xl font-bold text-[#22c55e] font-mono">
                    ${quote.low.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-[#00f0ff]/10 to-[#8b5cf6]/10 border border-[#00f0ff]/30 neon-glow-cyan">
                  <p className="text-sm text-[#00f0ff] mb-2">Mid Estimate</p>
                  <p className="text-4xl font-bold gradient-text font-mono">
                    ${quote.mid.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-sm text-[#64748b] mb-2">High Estimate</p>
                  <p className="text-3xl font-bold text-[#f59e0b] font-mono">
                    ${quote.high.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {quote.breakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center py-2 border-b border-[#27273a] last:border-0"
                  >
                    <span className="text-[#a1a1aa]">{item.label}</span>
                    <span className="text-[#e4e4e7] font-mono">${item.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t-2 border-[#27273a]">
                  <span className="text-lg font-semibold text-[#e4e4e7]">Mid Estimate Total</span>
                  <span className="text-2xl font-bold text-[#00f0ff] font-mono">
                    ${quote.mid.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Assumptions</h2>
              <ul className="space-y-2">
                {quote.assumptions.map((assumption, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-[#a1a1aa]">
                    <span className="text-[#00f0ff] mt-0.5">•</span>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 border-[#00f0ff]/30 neon-glow-cyan">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Request Quote
              </h3>
              <p className="text-sm text-[#64748b] mb-6">
                Ready to proceed? Submit your project for a formal PCBA quote from Raino.
              </p>
              <NeonButton className="w-full py-4 text-lg">Request PCBA Quote</NeonButton>
              <p className="text-xs text-[#64748b] mt-4 text-center">
                This will create an order intent and initiate the handoff process.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Quote Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Confidence</span>
                  <ConfidenceBadge level={quote.confidence} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Quote ID</span>
                  <span className="text-[#e4e4e7] font-mono">{quote.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Generated</span>
                  <span className="text-[#e4e4e7]">
                    {new Date(quote.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Valid Until</span>
                  <span className="text-[#e4e4e7]">
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Need Help?
              </h3>
              <p className="text-sm text-[#64748b] mb-4">
                Questions about your quote or want to discuss custom requirements?
              </p>
              <button className="w-full px-4 py-2 rounded-lg border border-[#27273a] text-[#a1a1aa] hover:border-[#00f0ff] hover:text-[#00f0ff] transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
