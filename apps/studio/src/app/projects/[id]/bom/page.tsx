import { getSupabaseAdmin, type DbBOM, type DbBOMRow } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import { DegradedModeBanner } from '@/components/DegradedModeBanner';

interface BOMPageProps {
  params: Promise<{ id: string }>;
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
    medium: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
    high: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
  };
  const colorClass = colors[level] ?? colors.low;

  return (
    <span className={`px-2 py-1 text-xs font-medium border ${colorClass}`}>
      {level.toUpperCase()}
    </span>
  );
}

export default async function BOMPage({ params }: BOMPageProps) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: bomData } = await db
    .from('boms')
    .select('*, rows:bom_rows(*)')
    .eq('project_id', id)
    .maybeSingle();

  const bom = (bomData as (DbBOM & { rows: DbBOMRow[] }) | null) ?? null;
  const rows: DbBOMRow[] = bom?.rows ?? [];
  const totalCost = rows.reduce(
    (sum: number, item: DbBOMRow) =>
      sum + Number(item.unit_price ?? 0) * (item.quantity ?? 1),
    0,
  );

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom`, active: true },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
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
              <h1 className="text-xl font-bold text-[#e4e4e7]">Bill of Materials</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {bom?.is_estimate && (
              <span className="px-3 py-1.5 bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-xs text-[#f59e0b] font-medium">
                Estimate
              </span>
            )}
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
        {bom?.is_estimate && (
          <DegradedModeBanner
            message="BOM prices are estimates. Some components use fixture data rather than live supplier pricing."
            severity="amber"
          />
        )}
        {rows.length === 0 ? (
          <div className="card p-8 text-center">
            <h2 className="text-lg font-semibold text-[#e4e4e7] mb-2">No BOM Generated</h2>
            <p className="text-[#64748b]">
              Complete the architecture phase first to generate a BOM.
            </p>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-[#27273a] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#e4e4e7]">BOM Items</h2>
                  <p className="text-sm text-[#64748b]">{rows.length} components</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Total Estimate:</span>
                  <span className="text-[#00f0ff] font-mono text-lg font-bold">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table-cyber">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Value</th>
                      <th>MPN</th>
                      <th>Manufacturer</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Extended</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item: DbBOMRow) => (
                      <tr key={item.id}>
                        <td className="font-mono text-[#00f0ff]">{item.ref}</td>
                        <td>{item.value}</td>
                        <td className="font-mono text-sm">{item.mpn}</td>
                        <td>{item.manufacturer}</td>
                        <td className="text-right font-mono">{item.quantity}</td>
                        <td className="text-right font-mono">
                          ${Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="text-right font-mono text-[#e4e4e7]">
                          ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <RiskBadge level={item.risk} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#27273a]">
                      <td colSpan={6} className="text-right font-semibold text-[#e4e4e7]">
                        Total (estimated):
                      </td>
                      <td className="text-right font-mono text-lg font-bold text-[#00f0ff]">
                        ${totalCost.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#22c55e]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[#a1a1aa]">Low Risk</span>
                </div>
                <p className="text-2xl font-bold text-[#22c55e]">
                  {rows.filter((i: DbBOMRow) => i.risk === 'low').length}
                </p>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#f59e0b]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[#a1a1aa]">Medium Risk</span>
                </div>
                <p className="text-2xl font-bold text-[#f59e0b]">
                  {rows.filter((i: DbBOMRow) => i.risk === 'medium').length}
                </p>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#ef4444]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[#a1a1aa]">High Risk</span>
                </div>
                <p className="text-2xl font-bold text-[#ef4444]">
                  {rows.filter((i: DbBOMRow) => i.risk === 'high').length}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
