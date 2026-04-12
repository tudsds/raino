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
          <tr className="border-b-2 border-[#27272a]">
            <th className="text-left py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Ref
            </th>
            <th className="text-left py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Value
            </th>
            <th className="text-left py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              MPN
            </th>
            <th className="text-left py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Manufacturer
            </th>
            <th className="text-right py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Qty
            </th>
            <th className="text-right py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Unit Price
            </th>
            <th className="text-center py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Risk
            </th>
            <th className="text-left py-3 px-4 text-[#71717a] font-[family-name:var(--font-heading)] uppercase text-xs tracking-wider border-2 border-[#27272a]">
              Lifecycle
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={cn(
                'border-b-2 border-[#27272a]/50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-[#1a1a24]',
              )}
              onClick={() => onRowClick?.(index)}
            >
              <td className="py-3 px-4 text-[#e4e4e7] font-[family-name:var(--font-mono)] border-2 border-[#27272a]">
                {row.reference}
              </td>
              <td className="py-3 px-4 text-[#a1a1aa] border-2 border-[#27272a]">{row.value}</td>
              <td className="py-3 px-4 text-[#00f0ff] font-[family-name:var(--font-mono)] text-sm border-2 border-[#27272a]">
                {row.mpn}
              </td>
              <td className="py-3 px-4 text-[#a1a1aa] border-2 border-[#27272a]">
                {row.manufacturer}
              </td>
              <td className="py-3 px-4 text-[#e4e4e7] text-right font-[family-name:var(--font-mono)] border-2 border-[#27272a]">
                {row.quantity}
              </td>
              <td className="py-3 px-4 text-right font-[family-name:var(--font-mono)] border-2 border-[#27272a]">
                <span className={cn(row.unitPrice === null && isEstimate && 'text-[#ffaa00]')}>
                  {formatCurrency(row.unitPrice)}
                </span>
              </td>
              <td className="py-3 px-4 text-center border-2 border-[#27272a]">
                <Badge variant={riskBadgeVariant[row.riskLevel]} size="sm">
                  {row.riskLevel.charAt(0).toUpperCase() + row.riskLevel.slice(1)}
                </Badge>
              </td>
              <td className="py-3 px-4 text-[#a1a1aa] capitalize border-2 border-[#27272a]">
                {row.lifecycle}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
