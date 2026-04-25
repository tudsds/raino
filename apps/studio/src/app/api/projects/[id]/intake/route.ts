import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import type { LLMMessage } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';

export const maxDuration = 60;

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

    const { data: historyMessages } = await db
      .from('intake_messages')
      .select('role, content')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    let assistantContent: string;
    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider, { maxRetries: 1 });
      const templateMessages = templateToMessages('intake', {
        message,
        files: attachments?.join(', ') ?? '',
        fileList: attachments?.join('\n') ?? '',
      });

      const priorHistory: LLMMessage[] = (historyMessages ?? [])
        .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
        .map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const messages: LLMMessage[] = [...templateMessages.slice(0, 1), ...priorHistory, ...templateMessages.slice(1)];
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

    const { count: userMsgCount } = await db
      .from('intake_messages')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
      .eq('role', 'user');

    const currentStatus = ownership.project.status;
    if (userMsgCount && userMsgCount >= 2 && currentStatus === 'intake') {
      await updateProjectStatus(id, 'clarifying');
    } else if (userMsgCount && userMsgCount >= 4 && currentStatus === 'clarifying') {
      const { data: allMessages } = await db
        .from('intake_messages')
        .select('role, content')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      const conversationText = (allMessages ?? [])
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join('\n\n');

      const { data: existingSpec } = await db
        .from('specs')
        .select('id')
        .eq('project_id', id)
        .maybeSingle();

      if (existingSpec) {
        await db
          .from('specs')
          .update({
            raw_text: conversationText,
            compiled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('project_id', id);
      } else {
        await db.from('specs').insert({
          project_id: id,
          raw_text: conversationText,
          requirements: [],
          constraints: [],
          interfaces: [],
          compiled_at: new Date().toISOString(),
        });
      }

      await updateProjectStatus(id, 'spec_compiled');
    }

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
