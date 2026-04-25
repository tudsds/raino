'use client';

import { cn } from '../styles/cn';
import { Badge } from './Badge';

export interface BOMTableProps {
  rows: Array<{
    reference: string;
    value: string;
    mpn: string;
    manufacturer: string;
    quantity: number;
    unitPrice: number | null;
    riskLevel: 'low' | 'medium' | 'high';
    lifecycle: string;
  }>;
  isEstimate: boolean;
  onRowClick?: (index: number) => void;
}

export function BOMTable({ rows, isEstimate, onRowClick }: BOMTableProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return isEstimate ? 'TBD' : 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const riskBadgeVariant = {
    low: 'success' as const,
    medium: 'warning' as const,
    high: 'error' as const,
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-base font-[family-name:var(--font-body)] border-collapse">
        <thead>
          <tr className="border-b border-white/[0.12]">
            <th className="text-left py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Ref
            </th>
            <th className="text-left py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Value
            </th>
            <th className="text-left py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              MPN
            </th>
            <th className="text-left py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Manufacturer
            </th>
            <th className="text-right py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Qty
            </th>
            <th className="text-right py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Unit Price
            </th>
            <th className="text-center py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Risk
            </th>
            <th className="text-left py-3 px-4 text-[#64748B] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border border-white/[0.08]">
              Lifecycle
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={cn(
                'border-b border-white/[0.06] transition-colors duration-300',
                onRowClick && 'cursor-pointer hover:bg-white/[0.04]',
              )}
              onClick={() => onRowClick?.(index)}
            >
              <td className="py-3 px-4 text-[#E2E8F0] font-[family-name:var(--font-mono)] text-sm border border-white/[0.08]">
                {row.reference}
              </td>
              <td className="py-3 px-4 text-[#94A3B8] border border-white/[0.08]">{row.value}</td>
              <td className="py-3 px-4 text-[#1565C0] font-[family-name:var(--font-mono)] text-sm border border-white/[0.08]">
                {row.mpn}
              </td>
              <td className="py-3 px-4 text-[#94A3B8] border border-white/[0.08]">
                {row.manufacturer}
              </td>
              <td className="py-3 px-4 text-[#E2E8F0] text-right font-[family-name:var(--font-mono)] border border-white/[0.08]">
                {row.quantity}
              </td>
              <td className="py-3 px-4 text-right font-[family-name:var(--font-mono)] border border-white/[0.08]">
                <span className={cn(row.unitPrice === null && isEstimate && 'text-[#FF9800]')}>
                  {formatCurrency(row.unitPrice)}
                </span>
              </td>
              <td className="py-3 px-4 text-center border border-white/[0.08]">
                <Badge variant={riskBadgeVariant[row.riskLevel]} size="sm">
                  {row.riskLevel.charAt(0).toUpperCase() + row.riskLevel.slice(1)}
                </Badge>
              </td>
              <td className="py-3 px-4 text-[#94A3B8] capitalize border border-white/[0.08]">
                {row.lifecycle}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
