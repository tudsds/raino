import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { prisma } from '@raino/db';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { updateProjectStatus } from '@/lib/data/project-queries';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { intakeMessages: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const intakeMessages = project.intakeMessages.map((m) => `${m.role}: ${m.content}`).join('\n');

    let specContent: string;
    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider);
      const messages = templateToMessages('spec_compilation', {
        intakeMessages,
        clarificationAnswers: '',
      });
      const response = await gateway.chat(messages);
      specContent = response.content;
    } catch {
      specContent = 'Specification compilation unavailable — AI service could not be reached.';
    }

    const spec = await prisma.spec.upsert({
      where: { projectId: id },
      update: {
        rawText: specContent,
        compiledAt: new Date(),
      },
      create: {
        projectId: id,
        requirements: [],
        constraints: {},
        interfaces: [],
        rawText: specContent,
        compiledAt: new Date(),
      },
    });

    await updateProjectStatus(id, 'spec_compiled');

    await createAuditEntry(id, {
      category: 'spec',
      action: 'spec_compiled',
      actor: auth.user.id,
      details: { specId: spec.id },
    });

    return NextResponse.json({
      projectId: id,
      spec: {
        id: spec.id,
        rawText: spec.rawText,
        requirements: spec.requirements,
        compiledAt: spec.compiledAt?.toISOString(),
      },
      status: 'compiled',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to compile specification' }, { status: 400 });
  }
}
