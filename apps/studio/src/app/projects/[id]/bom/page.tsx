import { getSupabaseAdmin, type DbBOM, type DbBOMRow } from '@/lib/db/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import { DegradedModeBanner } from '@/components/DegradedModeBanner';
import BOMPageClient from './BOMPageClient';

interface BOMPageProps {
  params: Promise<{ id: string }>;
}

function RiskBadge({ level }: { level: string }) {
  const textColors: Record<string, string> = {
    low: 'text-[#4CAF50]',
    medium: 'text-[#FF9800]',
    high: 'text-[#EF5350]',
  };
  const textColor = textColors[level] ?? textColors.low;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium glass-surface ${textColor}`}>
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
              <h1 className="text-xl font-bold text-[#E2E8F0]">Bill of Materials</h1>
              <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {bom?.is_estimate && (
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium glass-surface text-[#FF9800]">
                Estimate
              </span>
            )}
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
        {bom?.is_estimate && (
          <DegradedModeBanner
            message="BOM prices are estimates. Some components use fixture data rather than live supplier pricing."
            severity="amber"
          />
        )}
        {rows.length === 0 ? (
          <div className="glass-surface p-8 text-center">
            <h2 className="text-lg font-semibold text-[#E2E8F0] mb-2">No BOM Generated</h2>
            <p className="text-[#64748b] mb-4">
              Generate a Bill of Materials based on the architecture plan.
            </p>
            <BOMPageClient params={params} hasBOM={false} />
          </div>
        ) : (
          <>
            <div className="glass-elevated overflow-hidden">
              <div className="p-4 border-b border-white/[0.12] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#E2E8F0]">BOM Items</h2>
                  <p className="text-sm text-[#64748b]">{rows.length} components</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Total Estimate:</span>
                  <span className="text-[#1565C0] font-[family-name:var(--font-body)] text-lg font-bold">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Ref</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Value</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">MPN</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Manufacturer</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider text-right">Qty</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider text-right">Unit Price</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider text-right">Extended</th>
                      <th className="px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item: DbBOMRow, index: number) => (
                      <tr
                        key={item.id}
                        className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${
                          index % 2 === 0 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-[family-name:var(--font-body)] text-[#1565C0]">{item.ref}</td>
                        <td className="px-4 py-3 text-[#E2E8F0]">{item.value}</td>
                        <td className="px-4 py-3 font-[family-name:var(--font-body)] text-sm text-[#94A3B8]">{item.mpn}</td>
                        <td className="px-4 py-3 text-[#94A3B8]">{item.manufacturer}</td>
                        <td className="px-4 py-3 text-right font-[family-name:var(--font-body)] text-[#E2E8F0]">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-[family-name:var(--font-body)] text-[#94A3B8]">
                          ${Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-[family-name:var(--font-body)] text-[#E2E8F0]">
                          ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge level={item.risk} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/[0.12]">
                      <td colSpan={6} className="px-4 py-3 text-right font-semibold text-[#E2E8F0]">
                        Total (estimated):
                      </td>
                      <td className="px-4 py-3 text-right font-[family-name:var(--font-body)] text-lg font-bold text-[#1565C0]">
                        ${totalCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-surface glass-specular p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 glass-surface flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#4CAF50]"
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
                  <span className="text-sm text-[#94A3B8]">Low Risk</span>
                </div>
                <p className="text-2xl font-bold text-[#4CAF50]">
                  {rows.filter((i: DbBOMRow) => i.risk === 'low').length}
                </p>
              </div>

              <div className="glass-surface glass-specular p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 glass-surface flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#FF9800]"
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
                  <span className="text-sm text-[#94A3B8]">Medium Risk</span>
                </div>
                <p className="text-2xl font-bold text-[#FF9800]">
                  {rows.filter((i: DbBOMRow) => i.risk === 'medium').length}
                </p>
              </div>

              <div className="glass-surface glass-specular p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 glass-surface flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#EF5350]"
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
                  <span className="text-sm text-[#94A3B8]">High Risk</span>
                </div>
                <p className="text-2xl font-bold text-[#EF5350]">
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
