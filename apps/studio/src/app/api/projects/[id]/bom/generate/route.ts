import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createBOM } from '@/lib/data/bom-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';

export const maxDuration = 60;

const BOMComponentSchema = z.object({
  ref: z.string().describe('Reference designator, e.g. U1, R2, C3'),
  value: z.string().describe('Component value, e.g. 10kΩ, 100nF, STM32F407'),
  mpn: z.string().describe('Manufacturer Part Number'),
  manufacturer: z.string().describe('Manufacturer name'),
  package: z.string().describe('Package/footprint type, e.g. 0402, QFP-48'),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).describe('Estimated unit price in USD'),
  lifecycle: z.enum(['active', 'nrnd', 'obsolete', 'unknown']).optional(),
  risk: z.enum(['low', 'medium', 'high']).optional(),
  description: z.string().optional(),
  alternates: z
    .array(
      z.object({
        mpn: z.string(),
        manufacturer: z.string(),
        reason: z.string().optional(),
      }),
    )
    .optional(),
});

const BOMOutputSchema = z.object({
  components: z.array(BOMComponentSchema),
  notes: z.string().optional(),
});

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = ownership.project;

    const architecture = project.architecture
      ? JSON.stringify({
          mcu: project.architecture.mcu,
          power: project.architecture.power,
          interfaces: project.architecture.interfaces,
        })
      : 'No architecture selected';

    const candidateParts = project.ingestion
      ? JSON.stringify(project.ingestion.candidate_families)
      : 'No candidates ingested — use architecture and project description to infer components';

    const specConstraints = (() => {
      const spec = project.spec;
      if (!spec) return { powerBudget: '', boardArea: '', layerCount: '' };
      const raw = typeof spec.raw_text === 'string' ? spec.raw_text : '';
      const powerMatch = raw.match(/(?:power|voltage|supply)[^\n]*?(\d+\.?\d*\s*V)/i);
      const areaMatch = raw.match(/(?:board|area|size|dimension)[^\n]*?(\d+\s*[x×]\s*\d+\s*mm)/i);
      const layerMatch = raw.match(/(\d+)\s*layer/i);
      return {
        powerBudget: powerMatch?.[1] ?? '',
        boardArea: areaMatch?.[1] ?? '',
        layerCount: layerMatch?.[1] ?? '',
      };
    })();

    let bomGuidance: string;
    let bomRows: Array<{
      ref: string;
      value: string;
      mpn: string;
      manufacturer: string;
      pkg: string;
      quantity: number;
      unitPrice: number;
      currency: string;
      lifecycle: string;
      risk: string;
      description?: string;
    }> = [];

    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider, { maxRetries: 2 });
      const messages = templateToMessages('bom_generation', {
        architecture,
        candidateParts,
        powerBudget: specConstraints.powerBudget,
        boardArea: specConstraints.boardArea,
        layerCount: specConstraints.layerCount,
      });
      const structured = await gateway.chatStructured(messages, BOMOutputSchema);
      bomGuidance = structured.notes ?? 'BOM generated from LLM estimates.';
      bomRows = structured.components.map((c) => ({
        ref: c.ref,
        value: c.value,
        mpn: c.mpn,
        manufacturer: c.manufacturer,
        pkg: c.package,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        currency: 'USD',
        lifecycle: c.lifecycle ?? 'unknown',
        risk: c.risk ?? 'low',
        description: c.description,
      }));
    } catch {
      bomGuidance = 'BOM generation unavailable — AI service could not be reached.';
    }

    if (bomRows.length === 0) {
      return NextResponse.json(
        {
          error: 'BOM generation failed: no components were produced.',
          guidance: bomGuidance,
          suggestion: 'Please refine your project specification or try again.',
        },
        { status: 422 },
      );
    }

    const totalCost = bomRows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);

    const bom = await createBOM(id, {
      totalCost,
      currency: 'USD',
      lineCount: bomRows.length,
      isEstimate: true,
      rows: bomRows,
    });

    await updateProjectStatus(id, 'bom_generated');

    await createAuditEntry(id, {
      category: 'bom',
      action: 'bom_generated',
      actor: auth.user.id,
      details: { bomId: bom.id, guidance: bomGuidance.substring(0, 500) },
    });

    return NextResponse.json({
      projectId: id,
      bom: {
        id: bom.id,
        totalCost: Number(bom.total_cost),
        currency: bom.currency,
        lineCount: bom.line_count,
        isEstimate: bom.is_estimate,
        items: bom.rows.map((r) => ({
          id: r.id,
          ref: r.ref,
          value: r.value,
          mpn: r.mpn,
          manufacturer: r.manufacturer,
          package: r.package,
          quantity: r.quantity,
          unitPrice: Number(r.unit_price),
          currency: r.currency,
          lifecycle: r.lifecycle,
          risk: r.risk,
          description: r.description ?? '',
          alternates: r.alternates ?? [],
        })),
      },
      guidance: bomGuidance,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate BOM' }, { status: 400 });
  }
}
