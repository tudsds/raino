import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';

const IntakeMessageSchema = z.object({
  message: z.string().min(1).max(10000),
  attachments: z.array(z.string()).optional(),
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

    const body = await request.json();
    const parsed = IntakeMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { message, attachments } = parsed.data;
    const db = getSupabaseAdmin();

    // Save user message
    const { data: userMsg, error: userMsgError } = await db
      .from('intake_messages')
      .insert({
        project_id: id,
        role: 'user',
        content: message,
        attachments: attachments ?? null,
      })
      .select()
      .single();

    if (userMsgError) throw new Error(`Failed to save user message: ${userMsgError.message}`);

    let assistantContent: string;
    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider);
      const messages = templateToMessages('intake', {
        message,
        files: attachments?.join(', ') ?? '',
        fileList: attachments?.join('\n') ?? '',
      });
      const response = await gateway.chat(messages);
      assistantContent = response.content;
    } catch {
      assistantContent =
        'I received your message. The AI service is currently unavailable — your input has been saved and will be processed when the service is restored.';
    }

    // Save assistant response
    const { data: assistantMsg, error: assistantMsgError } = await db
      .from('intake_messages')
      .insert({
        project_id: id,
        role: 'assistant',
        content: assistantContent,
      })
      .select()
      .single();

    if (assistantMsgError) throw new Error(`Failed to save assistant message: ${assistantMsgError.message}`);

    await createAuditEntry(id, {
      category: 'spec',
      action: 'intake_message',
      actor: auth.user.id,
      details: { userMessageId: userMsg.id, assistantMessageId: assistantMsg.id },
    });

    return NextResponse.json({
      message: {
        id: assistantMsg.id,
        role: assistantMsg.role,
        content: assistantMsg.content,
        timestamp: assistantMsg.created_at,
      },
      projectId: id,
      status: 'processing',
    });
  } catch (err) {
    console.error('[api/projects/intake] Failed:', err);
    return NextResponse.json({ error: 'Failed to process intake message' }, { status: 400 });
  }
}
