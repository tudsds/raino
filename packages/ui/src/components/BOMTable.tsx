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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#27272a]">
            <th className="text-left py-3 px-4 text-[#71717a] font-medium">Ref</th>
            <th className="text-left py-3 px-4 text-[#71717a] font-medium">Value</th>
            <th className="text-left py-3 px-4 text-[#71717a] font-medium">MPN</th>
            <th className="text-left py-3 px-4 text-[#71717a] font-medium">Manufacturer</th>
            <th className="text-right py-3 px-4 text-[#71717a] font-medium">Qty</th>
            <th className="text-right py-3 px-4 text-[#71717a] font-medium">Unit Price</th>
            <th className="text-center py-3 px-4 text-[#71717a] font-medium">Risk</th>
            <th className="text-left py-3 px-4 text-[#71717a] font-medium">Lifecycle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={cn(
                'border-b border-[#27272a]/50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-[#1a1a24]',
              )}
              onClick={() => onRowClick?.(index)}
            >
              <td className="py-3 px-4 text-[#e4e4e7] font-mono">{row.reference}</td>
              <td className="py-3 px-4 text-[#a1a1aa]">{row.value}</td>
              <td className="py-3 px-4 text-[#00f0ff] font-mono text-xs">{row.mpn}</td>
              <td className="py-3 px-4 text-[#a1a1aa]">{row.manufacturer}</td>
              <td className="py-3 px-4 text-[#e4e4e7] text-right font-mono">{row.quantity}</td>
              <td className="py-3 px-4 text-right font-mono">
                <span className={cn(row.unitPrice === null && isEstimate && 'text-[#ffaa00]')}>
                  {formatCurrency(row.unitPrice)}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant={riskBadgeVariant[row.riskLevel]} size="sm">
                  {row.riskLevel.charAt(0).toUpperCase() + row.riskLevel.slice(1)}
                </Badge>
              </td>
              <td className="py-3 px-4 text-[#a1a1aa] capitalize">{row.lifecycle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
