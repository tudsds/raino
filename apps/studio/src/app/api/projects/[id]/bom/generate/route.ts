import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { prisma } from '@raino/db';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createBOM } from '@/lib/data/bom-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { updateProjectStatus } from '@/lib/data/project-queries';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { architecture: true, spec: true, ingestion: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const architecture = project.architecture
      ? JSON.stringify({
          mcu: project.architecture.mcu,
          power: project.architecture.power,
          interfaces: project.architecture.interfaces,
        })
      : 'No architecture selected';

    const candidateParts = project.ingestion
      ? JSON.stringify(project.ingestion.candidateFamilies)
      : 'No candidates ingested';

    let bomGuidance: string;
    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider);
      const messages = templateToMessages('bom_generation', {
        architecture,
        candidateParts,
        powerBudget: '',
        boardArea: '',
        layerCount: '',
      });
      const response = await gateway.chat(messages);
      bomGuidance = response.content;
    } catch {
      bomGuidance = 'BOM generation unavailable — AI service could not be reached.';
    }

    const bom = await createBOM(id, {
      totalCost: 0,
      currency: 'USD',
      lineCount: 0,
      isEstimate: true,
      rows: [],
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
        totalCost: Number(bom.totalCost),
        currency: bom.currency,
        lineCount: bom.lineCount,
        isEstimate: bom.isEstimate,
        items: bom.rows.map((r) => ({
          id: r.id,
          ref: r.ref,
          value: r.value,
          mpn: r.mpn,
          manufacturer: r.manufacturer,
          package: r.pkg,
          quantity: r.quantity,
          unitPrice: Number(r.unitPrice),
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
