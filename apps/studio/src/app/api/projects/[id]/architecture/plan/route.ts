import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { prisma } from '@raino/db';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';

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

    const specText = project.spec?.rawText ?? project.description ?? '';

    let archContent: string;
    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider);
      const messages = templateToMessages('architecture_selection', {
        spec: specText,
        requirementCount: '0',
        keyInterfaces: '',
        powerSource: '',
        targetVolume: '',
      });
      const response = await gateway.chat(messages);
      archContent = response.content;
    } catch {
      archContent = 'Architecture planning unavailable — AI service could not be reached.';
    }

    const architecture = await prisma.architecture.upsert({
      where: { projectId: id },
      update: {
        templateName: 'ai-recommended',
        rationale: archContent,
      },
      create: {
        projectId: id,
        templateId: 'ai-recommended',
        templateName: 'AI Recommended',
        rationale: archContent,
        interfaces: [],
        features: [],
      },
    });

    await updateProjectStatus(id, 'architecture_planned');

    await createAuditEntry(id, {
      category: 'architecture',
      action: 'architecture_planned',
      actor: auth.user.id,
      details: { architectureId: architecture.id },
    });

    return NextResponse.json({
      projectId: id,
      architecture: {
        id: architecture.id,
        templateId: architecture.templateId,
        templateName: architecture.templateName,
        mcu: architecture.mcu,
        power: architecture.power,
        interfaces: architecture.interfaces,
        features: architecture.features,
        rationale: architecture.rationale,
      },
      status: 'planned',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to plan architecture' }, { status: 400 });
  }
}
