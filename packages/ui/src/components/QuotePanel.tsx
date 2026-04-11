'use client';

import { cn } from '../styles/cn';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { StatusDot } from './StatusDot';

export interface QuotePanelProps {
  lowQuote: number;
  midQuote: number;
  highQuote: number;
  currency?: string;
  confidence: 'low' | 'medium' | 'high';
  assumptions: string[];
  isEstimate: boolean;
  onRequestQuote?: () => void;
}

export function QuotePanel({
  lowQuote,
  midQuote,
  highQuote,
  currency = '$',
  confidence,
  assumptions,
  isEstimate,
  onRequestQuote,
}: QuotePanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace('$', currency);
  };

  const confidenceConfig = {
    low: { label: 'Low Confidence', status: 'warning' as const, color: 'text-[#ffaa00]' },
    medium: { label: 'Medium Confidence', status: 'pending' as const, color: 'text-[#00f0ff]' },
    high: { label: 'High Confidence', status: 'active' as const, color: 'text-[#00ff88]' },
  };

  const conf = confidenceConfig[confidence];

  return (
    <Card variant="neon" glow glowColor="cyan" className="p-6">
      <div className="space-y-6">
        {isEstimate && (
          <div className="flex items-center justify-between">
            <Badge variant="info" size="md">
              Rough Estimate
            </Badge>
            <StatusDot status={conf.status} size="sm" label={conf.label} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[#0a0a0f] rounded-lg border border-[#27272a]">
            <p className="text-[#71717a] text-sm mb-1">Low</p>
            <p className={cn('text-xl font-bold font-mono', conf.color)}>
              {formatCurrency(lowQuote)}
            </p>
          </div>
          <div className="text-center p-4 bg-[#0a0a0f] rounded-lg border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <p className="text-[#00f0ff] text-sm mb-1 font-medium">Expected</p>
            <p className="text-2xl font-bold font-mono text-[#00f0ff]">
              {formatCurrency(midQuote)}
            </p>
          </div>
          <div className="text-center p-4 bg-[#0a0a0f] rounded-lg border border-[#27272a]">
            <p className="text-[#71717a] text-sm mb-1">High</p>
            <p className={cn('text-xl font-bold font-mono', conf.color)}>
              {formatCurrency(highQuote)}
            </p>
          </div>
        </div>

        {assumptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#a1a1aa]">Assumptions:</p>
            <ul className="space-y-1">
              {assumptions.map((assumption, index) => (
                <li key={index} className="text-sm text-[#71717a] flex items-start gap-2">
                  <span className="text-[#00f0ff] mt-1">•</span>
                  {assumption}
                </li>
              ))}
            </ul>
          </div>
        )}

        {onRequestQuote && (
          <Button variant="primary" glow className="w-full" onClick={onRequestQuote}>
            Request Detailed Quote
          </Button>
        )}
      </div>
    </Card>
  );
}
