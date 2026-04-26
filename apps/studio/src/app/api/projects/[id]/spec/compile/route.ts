import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';

export const maxDuration = 60;

function sseEncode(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

interface IntakeMessage {
  role: string;
  content: string;
}

function summarizeIntakeMessages(messages: IntakeMessage[]): string {
  if (!messages || messages.length === 0) return '';

  const userMessages: string[] = [];
  const assistantRequirements: string[] = [];

  for (const msg of messages) {
    const content = msg.content?.trim() ?? '';
    if (!content) continue;

    if (msg.role === 'user') {
      if (content.length < 10 || /^\s*(yes|no|ok|sure|thanks|thank you)\s*$/i.test(content)) {
        continue;
      }
      userMessages.push(content);
    } else if (msg.role === 'assistant') {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.endsWith('?')) continue;
        if (/^(what|how|can you|would you|please|could you|do you)/i.test(trimmed)) continue;
        const hasRequirementKeyword = /(?:need|require|must|should|will|voltage|current|power|size|board|connector|interface|protocol|frequency|speed|temperature|dimension)/i.test(trimmed);
        const hasQuantity = /\d+(?:\s*(?:V|A|W|Hz|MHz|GHz|mm|cm|inch|°C|°F))?/.test(trimmed);
        if (trimmed.length > 20 && (hasRequirementKeyword || hasQuantity)) {
          assistantRequirements.push(trimmed);
        }
      }
    }
  }

  const uniqueUserMessages = userMessages.filter((um) => {
    const umLower = um.toLowerCase();
    return !assistantRequirements.some((ar) => ar.toLowerCase().includes(umLower.slice(0, 40)));
  });

  const parts: string[] = [];

  if (assistantRequirements.length > 0) {
    parts.push('=== Extracted Requirements ===');
    parts.push(...assistantRequirements.slice(0, 30));
  }

  if (uniqueUserMessages.length > 0) {
    parts.push('=== User Provided Details ===');
    parts.push(...uniqueUserMessages.slice(0, 10));
  }

  return parts.join('\n');
}

const RequirementSchema = z.object({
  id: z.string(),
  category: z.enum([
    'functional',
    'performance',
    'physical',
    'environmental',
    'regulatory',
    'manufacturing',
  ]),
  description: z.string(),
  priority: z.enum(['must', 'should', 'could', 'wont']),
  rationale: z.string().optional(),
});

const ConstraintSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  source: z.string().optional(),
});

const InterfaceSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  direction: z.enum(['input', 'output', 'bidirectional']).optional(),
  protocol: z.string().optional(),
  notes: z.string().optional(),
});

const SpecOutputSchema = z.object({
  productName: z.string().optional(),
  summary: z.string(),
  requirements: z.array(RequirementSchema),
  constraints: z.array(ConstraintSchema),
  interfaces: z.array(InterfaceSpecSchema),
});

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const project = ownership.project;
    const rawIntakeMessages = project.intakeMessages as IntakeMessage[];
    const summarizedIntake = summarizeIntakeMessages(rawIntakeMessages);
    const rawIntakeLength = rawIntakeMessages.map((m) => `${m.role}: ${m.content}`).join('\n').length;

    console.log('[api/spec/compile] Project:', id, 'intakeMessages count:', rawIntakeMessages.length, 'raw intake length:', rawIntakeLength, 'summarized length:', summarizedIntake.length, 'compression ratio:', rawIntakeLength > 0 ? Math.round((1 - summarizedIntake.length / rawIntakeLength) * 100) + '%' : 'N/A');
    console.log('[api/spec/compile] KIMI_API_KEY set:', !!process.env.KIMI_API_KEY, 'KIMI_API_BASE_URL:', process.env.KIMI_API_BASE_URL ?? '(default)');

    if (!summarizedIntake.trim()) {
      console.error('[api/spec/compile] No intake content found for project:', id);
      return new Response(JSON.stringify({ error: 'No intake messages found. Please complete the intake conversation first.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(sseEncode({ type: 'progress', status: 'compiling' })));

        const keepalive = setInterval(() => {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        }, 10_000);

        let specContent = 'Specification compilation unavailable — AI service could not be reached.';
        let structuredRequirements: z.infer<typeof RequirementSchema>[] = [];
        let structuredConstraints: z.infer<typeof ConstraintSchema>[] = [];
        let structuredInterfaces: z.infer<typeof InterfaceSpecSchema>[] = [];

        try {
          const provider = new KimiProvider(120_000);
          const isAvailable = await provider.isAvailable();
          console.log('[api/spec/compile] Provider available:', isAvailable);

          const gateway = new LLMGateway(provider, { maxRetries: 2 });
          const messages = templateToMessages('spec_compilation', {
            intakeMessages: summarizedIntake,
            clarificationAnswers: '',
          });

          const totalPromptLength = messages.reduce((sum, m) => sum + (m.content?.length ?? 0), 0);
          console.log('[api/spec/compile] Messages count:', messages.length, 'total prompt length:', totalPromptLength, 'system prompt length:', messages[0]?.content?.length ?? 0, 'user prompt length:', messages[1]?.content?.length ?? 0);

          const streamStartTime = Date.now();
          let accumulatedText = '';
          let chunkCount = 0;
          for await (const evt of gateway.chatStream(messages, { maxTokens: 2048 })) {
            if (evt.type === 'content' && evt.content) {
              accumulatedText += evt.content;
              chunkCount++;
            }
            if (evt.type === 'done') {
              const elapsedMs = Date.now() - streamStartTime;
              console.log('[api/spec/compile] Stream done event received. Chunks:', chunkCount, 'accumulatedText length:', accumulatedText.length, 'elapsedMs:', elapsedMs);
            }
          }

          const totalElapsedMs = Date.now() - streamStartTime;
          console.log('[api/spec/compile] Stream completed. accumulatedText length:', accumulatedText.length, 'chunkCount:', chunkCount, 'totalElapsedMs:', totalElapsedMs);

          if (!accumulatedText.trim()) {
            throw new Error('LLM returned no content — the AI service may be overloaded. Please try again.');
          }

          if (accumulatedText) {
            try {
              const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
              const jsonStr = jsonMatch ? jsonMatch[0] : accumulatedText;
              const parsed = JSON.parse(jsonStr);
              const validated = SpecOutputSchema.safeParse(parsed);
              if (validated.success) {
                specContent = validated.data.summary;
                structuredRequirements = validated.data.requirements;
                structuredConstraints = validated.data.constraints;
                structuredInterfaces = validated.data.interfaces;
              } else {
                specContent = accumulatedText;
              }
            } catch {
              specContent = accumulatedText;
            }
          }

          const db = getSupabaseAdmin();
          const { data: existingSpec } = await db
            .from('specs')
            .select('id')
            .eq('project_id', id)
            .maybeSingle();

          let spec;
          if (existingSpec) {
            const { data, error } = await db
              .from('specs')
              .update({
                requirements: structuredRequirements,
                constraints: structuredConstraints,
                interfaces: structuredInterfaces,
                raw_text: specContent,
                compiled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('project_id', id)
              .select()
              .single();
            if (error) throw error;
            spec = data;
          } else {
            const { data, error } = await db
              .from('specs')
              .insert({
                project_id: id,
                requirements: structuredRequirements,
                constraints: structuredConstraints,
                interfaces: structuredInterfaces,
                raw_text: specContent,
                compiled_at: new Date().toISOString(),
              })
              .select()
              .single();
            if (error) throw error;
            spec = data;
          }

          await updateProjectStatus(id, 'spec_compiled');

          await createAuditEntry(id, {
            category: 'spec',
            action: 'spec_compiled',
            actor: auth.user.id,
            details: { specId: spec.id },
          });

          controller.enqueue(
            encoder.encode(
              sseEncode({
                type: 'done',
                spec: {
                  id: spec.id,
                  rawText: spec.raw_text,
                  requirements: spec.requirements,
                  constraints: spec.constraints,
                  interfaces: spec.interfaces,
                  compiledAt: spec.compiled_at,
                },
                status: 'compiled',
              }),
            ),
          );
        } catch (err) {
          console.error('[api/spec/compile] Stream error:', err);
          controller.enqueue(
            encoder.encode(
              sseEncode({
                type: 'error',
                error: err instanceof Error ? err.message : 'Spec compilation failed',
              }),
            ),
          );
        } finally {
          clearInterval(keepalive);
          controller.close();
        }
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
    console.error('[api/spec/compile] Failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to compile specification' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
