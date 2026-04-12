import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getQuote, createQuote } from '@/lib/data/quote-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { updateProjectStatus } from '@/lib/data/project-queries';
import { getBOM } from '@/lib/data/bom-queries';
import { calculateRoughQuote } from '@raino/core';
import type { BOM, BOMRow } from '@raino/core';

const QuoteRequestSchema = z.object({
  quantity: z.number().int().positive().default(100),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const quote = await getQuote(id);

    if (!quote) {
      return NextResponse.json({ projectId: id, quote: null });
    }

    return NextResponse.json({
      projectId: id,
      quote: {
        id: quote.id,
        low: Number(quote.lowQuote),
        mid: Number(quote.midQuote),
        high: Number(quote.highQuote),
        confidence: quote.confidence,
        breakdown: quote.breakdown,
        assumptions: quote.assumptions,
        isEstimate: quote.isEstimate,
        quantity: quote.quantity,
        generatedAt: quote.createdAt.toISOString(),
        validUntil: new Date(quote.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = QuoteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quantity } = parsed.data;

    const bom = await getBOM(id);

    if (!bom) {
      return NextResponse.json(
        { error: 'No BOM found for project. Please generate a BOM first.' },
        { status: 400 },
      );
    }

    const coreRows: BOMRow[] = bom.rows.map((r) => ({
      reference: r.ref,
      value: r.value,
      symbol: r.mpn,
      footprint: r.pkg,
      manufacturer: r.manufacturer,
      mpn: r.mpn,
      lifecycle: (r.lifecycle as BOMRow['lifecycle']) || 'unknown',
      alternates: [],
      dnp: false,
      unitPrice: Number(r.unitPrice),
      currency: r.currency,
      provenance: {
        source: r.provenanceSource ?? 'system',
        timestamp: new Date(),
        confidence: 0.5,
      },
      riskLevel: (r.risk as BOMRow['riskLevel']) || 'low',
    }));

    const coreBOM: BOM = {
      id: bom.id,
      projectId: bom.projectId,
      rows: coreRows,
      createdAt: bom.createdAt,
      updatedAt: bom.updatedAt,
      version: 1,
    };

    const roughQuote = calculateRoughQuote(coreBOM, {
      designAutomationFee: 500,
      engineeringReviewFee: 300,
      isEstimate: bom.isEstimate,
      assumptions: [
        `Quote is for ${quantity} units with standard 2-week lead time`,
        'PCB specifications: 4-layer, 1.6mm, ENIG finish',
        'Assembly includes AOI and basic functional test',
        'Does not include custom tooling or NRE charges',
        'Shipping and customs not included',
      ],
    });

    const quote = await createQuote(id, {
      lowQuote: Math.round(roughQuote.lowQuote),
      midQuote: Math.round(roughQuote.midQuote),
      highQuote: Math.round(roughQuote.highQuote),
      confidence: roughQuote.confidenceLevel,
      currency: 'USD',
      assumptions: roughQuote.assumptions,
      breakdown: [
        { label: 'Design Automation Fee', value: roughQuote.designAutomationFee },
        { label: 'Engineering Review', value: roughQuote.engineeringReviewFee },
        { label: 'PCB Fabrication', value: roughQuote.pcbFabricationEstimate },
        { label: 'Components', value: roughQuote.componentsEstimate },
        { label: 'Assembly', value: roughQuote.assemblyEstimate },
        { label: 'QA & Handling', value: roughQuote.qaPackagingHandling },
      ],
      isEstimate: roughQuote.isEstimate,
      quantity,
    });

    await updateProjectStatus(id, 'quoted');

    await createAuditEntry(id, {
      category: 'quote',
      action: 'quote_generated',
      actor: auth.user.id,
      details: {
        quoteId: quote.id,
        quantity,
        midQuote: Number(quote.midQuote),
        confidence: quote.confidence,
      },
    });

    return NextResponse.json({
      projectId: id,
      quote: {
        id: quote.id,
        low: Number(quote.lowQuote),
        mid: Number(quote.midQuote),
        high: Number(quote.highQuote),
        confidence: quote.confidence,
        breakdown: quote.breakdown,
        assumptions: quote.assumptions,
        isEstimate: quote.isEstimate,
        quantity: quote.quantity,
        generatedAt: quote.createdAt.toISOString(),
        validUntil: new Date(quote.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 400 });
  }
}
