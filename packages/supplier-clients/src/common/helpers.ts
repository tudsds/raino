/**
 * Shared pricing and quote helpers used by real adapters.
 * Mock adapters maintain their own local copies to remain unchanged.
 */

export function resolvePrice(
  part: { unitPrice: number | null; breakpoints?: Array<{ quantity: number; price: number }> },
  qty: number,
): number | null {
  if (part.breakpoints && part.breakpoints.length > 0) {
    const sorted = [...part.breakpoints].sort((a, b) => b.quantity - a.quantity);
    for (const bp of sorted) {
      if (qty >= bp.quantity) return bp.price;
    }
  }
  return part.unitPrice ?? null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function parseLeadWeeks(leadTime: string): number {
  const match = leadTime.match(/(\d+)/);
  return match ? parseInt(match[1]!, 10) : 0;
}

export function mapLifecycleStatus(
  status?: string,
): 'active' | 'obsolete' | 'not_recommended' | 'end_of_life' | 'unknown' {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s.includes('active')) return 'active';
  if (s.includes('obsolete') || s.includes('discontinued')) return 'obsolete';
  if (s.includes('not recommended') || s.includes('not_recommended')) return 'not_recommended';
  if (s.includes('end of life') || s.includes('end_of_life')) return 'end_of_life';
  return 'unknown';
}
