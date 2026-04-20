import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getQuote, createQuote } from '@/lib/data/quote-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import { getBOM } from '@/lib/data/bom-queries';
import { calculateRoughQuote } from '@raino/core';
import type { BOM, BOMRow } from '@raino/core';
import {
  aggregateSupplierPrices,
  type SupplierPriceResult,
} from '@/lib/quotes/supplier-comparison';

const QuoteRequestSchema = z.object({
  quantity: z.number().int().positive().default(100),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const quote = await getQuote(id);

    if (!quote) {
      return NextResponse.json({ projectId: id, quote: null });
    }

    return NextResponse.json({
      projectId: id,
      quote: {
        id: quote.id,
        low: Number(quote.low_quote),
        mid: Number(quote.mid_quote),
        high: Number(quote.high_quote),
        confidence: quote.confidence,
        breakdown: quote.breakdown,
        assumptions: quote.assumptions,
        isEstimate: quote.is_estimate,
        dataSource: quote.is_estimate ? 'llm_estimates' : 'live_supplier',
        disclaimer: quote.is_estimate
          ? 'This is a rough estimate based on AI-generated component pricing. Actual costs may vary significantly. Request a formal quote for verified pricing.'
          : 'Quote based on live supplier pricing data. Final costs subject to change at time of order.',
        quantity: quote.quantity,
        generatedAt: quote.created_at,
        validUntil: new Date(new Date(quote.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

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
      footprint: r.package,
      manufacturer: r.manufacturer,
      mpn: r.mpn,
      lifecycle: (r.lifecycle as BOMRow['lifecycle']) || 'unknown',
      alternates: [],
      dnp: false,
      unitPrice: Number(r.unit_price),
      currency: r.currency,
      provenance: {
        source: r.provenance_source ?? 'system',
        timestamp: new Date(),
        confidence: 0.5,
      },
      riskLevel: (r.risk as BOMRow['riskLevel']) || 'low',
    }));

    const coreBOM: BOM = {
      id: bom.id,
      projectId: bom.project_id,
      rows: coreRows,
      createdAt: bom.created_at,
      updatedAt: bom.updated_at,
      version: 1,
    };

    let supplierComparison: SupplierPriceResult[] = [];
    let supplierHasEstimates = bom.is_estimate;

    try {
      const supplierInputs = coreRows
        .filter((r) => r.mpn && r.mpn !== 'unknown')
        .map((r) => ({ mpn: r.mpn, quantity }));

      if (supplierInputs.length > 0) {
        supplierComparison = await aggregateSupplierPrices(supplierInputs);

        const priceByMpn = new Map(
          supplierComparison
            .filter((r) => r.bestPrice !== null)
            .map((r) => [r.mpn, r.bestPrice as number]),
        );

        for (const row of coreBOM.rows) {
          const override = priceByMpn.get(row.mpn);
          if (override !== undefined) {
            row.unitPrice = override;
          }
        }

        supplierHasEstimates = supplierComparison.some((r) => r.isEstimate || r.bestPrice === null);
      }
    } catch {
      supplierComparison = [];
      supplierHasEstimates = true;
    }

    const hasValidPrice = coreBOM.rows.some(
      (r) => typeof r.unitPrice === 'number' && r.unitPrice > 0,
    );
    if (coreBOM.rows.length === 0 || !hasValidPrice) {
      return NextResponse.json(
        {
          error:
            'BOM has no rows with valid pricing. Please generate a BOM with priced components first.',
        },
        { status: 422 },
      );
    }

    const roughQuote = calculateRoughQuote(coreBOM, {
      designAutomationFee: 500,
      engineeringReviewFee: 300,
      isEstimate: bom.is_estimate,
      assumptions: [
        `Quote is for ${quantity} units with standard 2-week lead time`,
        'PCB specifications: 4-layer, 1.6mm, ENIG finish',
        'Assembly includes AOI and basic functional test',
        'Does not include custom tooling or NRE charges',
        'Shipping and customs not included',
        bom.is_estimate
          ? 'All component prices are LLM-generated estimates, not verified against live supplier data'
          : 'Component prices sourced from live supplier queries',
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
      isEstimate: supplierHasEstimates || roughQuote.isEstimate,
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
        midQuote: Number(quote.mid_quote),
        confidence: quote.confidence,
      },
    });

    let dataSource: 'live_supplier' | 'mixed_supplier_estimates' | 'llm_estimates';
    if (supplierComparison.length === 0) {
      dataSource = bom.is_estimate ? 'llm_estimates' : 'live_supplier';
    } else if (supplierComparison.every((r) => !r.isEstimate && r.bestPrice !== null)) {
      dataSource = 'live_supplier';
    } else {
      dataSource = 'mixed_supplier_estimates';
    }

    const isEstimateFinal = supplierHasEstimates || roughQuote.isEstimate;
    const disclaimer = isEstimateFinal
      ? 'This is a rough estimate based on AI-generated component pricing. Actual costs may vary significantly. Request a formal quote for verified pricing.'
      : 'Quote based on live supplier pricing data. Final costs subject to change at time of order.';

    return NextResponse.json({
      projectId: id,
      quote: {
        id: quote.id,
        low: Number(quote.low_quote),
        mid: Number(quote.mid_quote),
        high: Number(quote.high_quote),
        confidence: quote.confidence,
        breakdown: quote.breakdown,
        assumptions: quote.assumptions,
        isEstimate: quote.is_estimate,
        dataSource,
        disclaimer,
        quantity: quote.quantity,
        generatedAt: quote.created_at,
        validUntil: new Date(new Date(quote.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        supplierComparison: supplierComparison.map((r) => ({
          mpn: r.mpn,
          bestPrice: r.bestPrice,
          bestSupplier: r.bestSupplier,
          allQuotes: r.allQuotes,
          isEstimate: r.isEstimate,
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 400 });
  }
}
