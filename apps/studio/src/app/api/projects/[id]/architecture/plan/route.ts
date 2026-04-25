import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';

export const maxDuration = 60;

const ArchitectureOutputSchema = z.object({
  mcu: z.string().describe('Recommended MCU/MPU, e.g. "RP2040" or "STM32F407"'),
  power: z.string().describe('Power architecture description, e.g. "USB-C 5V → AP2112 3.3V LDO"'),
  interfaces: z.array(z.string()).describe('Key interfaces, e.g. ["USB-C", "I2C", "SPI", "GPIO"]'),
  features: z.array(z.string()).describe('Key board features, e.g. ["WS2812B RGB LED", "Boot button"]'),
  rationale: z.string().describe('Why this architecture was chosen'),
  estimatedComponentCount: z.number().optional(),
  risks: z.array(z.string()).optional(),
});

const fallbackArchitecture: z.infer<typeof ArchitectureOutputSchema> = {
  mcu: '',
  power: '',
  interfaces: [],
  features: [],
  rationale: 'Architecture planning unavailable — AI service could not be reached.',
};

function sseEncode(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

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
    const specText = (project.description ?? '').substring(0, 500);

    const messages = templateToMessages('architecture_selection', {
      spec: specText,
      requirementCount: '0',
      keyInterfaces: '',
      powerSource: '',
      targetVolume: '',
    });
    const enrichedMessages = messages.map((msg, idx) => {
      if (idx === messages.length - 1) {
        return {
          ...msg,
          content: `${typeof msg.content === 'string' ? msg.content : ''}\n\nRespond ONLY with a JSON object: {"mcu":"...","power":"...","interfaces":[...],"features":[...],"rationale":"...","estimatedComponentCount":N,"risks":[...]}`,
        };
      }
      return msg;
    });

    const encoder = new TextEncoder();
    const db = getSupabaseAdmin();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(sseEncode({ type: 'progress', status: 'generating' })));

        let accumulatedText = '';

        try {
          const provider = new KimiProvider();
          const gateway = new LLMGateway(provider, { maxRetries: 1 });

          const response = await gateway.chat(enrichedMessages, { maxTokens: 1024 });
          accumulatedText = response.content;
        } catch (llmError) {
          console.error('[api/architecture/plan] LLM call failed:', llmError);
        }

        let archData: z.infer<typeof ArchitectureOutputSchema>;
        if (accumulatedText) {
          try {
            const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : accumulatedText;
            const parsed = JSON.parse(jsonStr);
            const validated = ArchitectureOutputSchema.safeParse(parsed);
            archData = validated.success ? validated.data : fallbackArchitecture;
          } catch {
            archData = fallbackArchitecture;
          }
        } else {
          archData = fallbackArchitecture;
        }

        const { data: existing } = await db
          .from('architectures')
          .select('id')
          .eq('project_id', id)
          .maybeSingle();

        const archRecord = {
          template_name: 'ai-recommended',
          mcu: archData.mcu || null,
          power: archData.power || null,
          interfaces: archData.interfaces ?? [],
          features: archData.features ?? [],
          rationale: archData.rationale,
          updated_at: new Date().toISOString(),
        };

        let architecture;
        if (existing) {
          const { data, error } = await db
            .from('architectures')
            .update(archRecord)
            .eq('project_id', id)
            .select()
            .single();
          if (error) throw error;
          architecture = data;
        } else {
          const { data, error } = await db
            .from('architectures')
            .insert({
              project_id: id,
              template_id: 'ai-recommended',
              ...archRecord,
            })
            .select()
            .single();
          if (error) throw error;
          architecture = data;
        }

        await updateProjectStatus(id, 'architecture_planned');
        await createAuditEntry(id, {
          category: 'architecture',
          action: 'architecture_planned',
          actor: auth.user.id,
          details: { architectureId: architecture.id, mcu: archData.mcu },
        });

        controller.enqueue(
          encoder.encode(
            sseEncode({
              type: 'done',
              architecture: {
                id: architecture.id,
                templateId: architecture.template_id,
                templateName: architecture.template_name,
                mcu: architecture.mcu,
                power: architecture.power,
                interfaces: architecture.interfaces,
                features: architecture.features,
                rationale: architecture.rationale,
              },
              status: 'planned',
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
    console.error('[api/architecture/plan] Failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to plan architecture' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
