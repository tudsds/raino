import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';

const ClarifySchema = z.object({
  message: z.string().min(1).max(10000),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = ownership.project;

    const body = await request.json();
    const parsed = ClarifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { message } = parsed.data;

    const intakeMessages = project.intakeMessages.map((m) => `${m.role}: ${m.content}`).join('\n');

    let clarificationContent: string;
    try {
      const provider = new KimiProvider(50_000);
      const gateway = new LLMGateway(provider);
      const messages = templateToMessages('clarification', {
        projectContext: intakeMessages,
        currentSpec: project.spec ? JSON.stringify(project.spec.requirements) : 'No spec yet',
      });

      let accumulatedText = '';
      for await (const evt of gateway.chatStream(messages, { maxTokens: 2048 })) {
        if (evt.type === 'content' && evt.content) accumulatedText += evt.content;
      }
      clarificationContent =
        accumulatedText || 'Clarification service returned no content. Please try again.';
    } catch {
      clarificationContent =
        'Clarification service unavailable. Please try again later or provide more details in the intake.';
    }

    await createAuditEntry(id, {
      category: 'spec',
      action: 'clarification_requested',
      actor: auth.user.id,
      details: { message },
    });

    return NextResponse.json({
      clarification: {
        id: `clarify-${Date.now()}`,
        content: clarificationContent,
      },
      projectId: id,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate clarification' }, { status: 400 });
  }
}
