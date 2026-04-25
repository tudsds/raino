import { NextRequest } from 'next/server';
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

function sseEncode(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const parsed = IntakeMessageSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { message, attachments } = parsed.data;
    const db = getSupabaseAdmin();

    const { data: historyMessages } = await db
      .from('intake_messages')
      .select('role, content')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

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

    const MAX_HISTORY_MESSAGES = 8;
    const allHistory: LLMMessage[] = (historyMessages ?? [])
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
    const priorHistory: LLMMessage[] = allHistory.slice(-MAX_HISTORY_MESSAGES);

    const templateMessages = templateToMessages('intake', {
      message,
      files: attachments?.join(', ') ?? '',
      fileList: attachments?.join('\n') ?? '',
    });
    const messages: LLMMessage[] = [
      ...templateMessages.slice(0, 1),
      ...priorHistory,
      ...templateMessages.slice(1),
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let assistantContent = '';

        try {
          const provider = new KimiProvider(50_000);
          const gateway = new LLMGateway(provider, { maxRetries: 2 });

          for await (const event of gateway.chatStream(messages, { maxTokens: 2048 })) {
            if (event.type === 'content' && event.content) {
              assistantContent += event.content;
              controller.enqueue(encoder.encode(sseEncode({ type: 'content', content: event.content })));
            }
          }
        } catch (llmError) {
          console.error('[api/projects/intake] LLM stream failed:', llmError);
          assistantContent =
            'I\'m having trouble connecting to the AI service right now. Your message has been saved. Please try sending it again — the AI service may recover momentarily.';
          controller.enqueue(
            encoder.encode(sseEncode({ type: 'content', content: assistantContent })),
          );
        }

        // Save accumulated response to DB after stream ends
        const { data: assistantMsg, error: assistantMsgError } = await db
          .from('intake_messages')
          .insert({
            project_id: id,
            role: 'assistant',
            content: assistantContent,
          })
          .select()
          .single();

        if (assistantMsgError) {
          console.error('[api/projects/intake] Failed to save assistant message:', assistantMsgError.message);
          controller.enqueue(
            encoder.encode(sseEncode({ type: 'error', error: 'Failed to save response' })),
          );
          controller.close();
          return;
        }

        await createAuditEntry(id, {
          category: 'spec',
          action: 'intake_message',
          actor: auth.user.id,
          details: { userMessageId: userMsg.id, assistantMessageId: assistantMsg.id },
        });

        // Project status advancement
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

        controller.enqueue(
          encoder.encode(
            sseEncode({
              type: 'done',
              message: {
                id: assistantMsg.id,
                role: assistantMsg.role,
                content: assistantMsg.content,
                timestamp: assistantMsg.created_at,
              },
            }),
          ),
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[api/projects/intake] Failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to process intake message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
