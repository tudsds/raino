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

/**
 * Generate a basic spec from summarized intake data without LLM.
 * Used as fallback when the LLM call times out or fails.
 * The structured data already contains extracted requirements from intake,
 * so we parse those lines back into structured spec fields.
 */
interface FallbackSpecResult {
  summary: string;
  requirements: z.infer<typeof RequirementSchema>[];
  constraints: z.infer<typeof ConstraintSchema>[];
  interfaces: z.infer<typeof InterfaceSpecSchema>[];
}

/** Known connector/interface patterns to detect in intake text. */
const CONNECTOR_PATTERNS: Array<{ pattern: RegExp; name: string; type: string; protocol?: string }> = [
  { pattern: /\bUSB[-_\s]?C\b/i, name: 'USB-C', type: 'connector', protocol: 'USB' },
  { pattern: /\bUSB[-_\s]?3\.?\d*\b/i, name: 'USB', type: 'connector', protocol: 'USB' },
  { pattern: /\bUART\b/i, name: 'UART', type: 'serial', protocol: 'UART' },
  { pattern: /\bSPI\b/i, name: 'SPI', type: 'serial', protocol: 'SPI' },
  { pattern: /\bI2C\b/i, name: 'I2C', type: 'serial', protocol: 'I2C' },
  { pattern: /\bCAN[-_\s]?bus\b|\bCAN\b/i, name: 'CAN', type: 'serial', protocol: 'CAN' },
  { pattern: /\bEthernet\b|\bRJ45\b/i, name: 'Ethernet', type: 'connector', protocol: 'Ethernet' },
  { pattern: /\bHDMI\b/i, name: 'HDMI', type: 'connector', protocol: 'HDMI' },
  { pattern: /\bGPIO\b/i, name: 'GPIO', type: 'digital', protocol: 'GPIO' },
  { pattern: /\bADC\b/i, name: 'ADC', type: 'analog', protocol: 'ADC' },
  { pattern: /\bDAC\b/i, name: 'DAC', type: 'analog', protocol: 'DAC' },
  { pattern: /\bPWM\b/i, name: 'PWM', type: 'digital', protocol: 'PWM' },
  { pattern: /\bJTAG\b/i, name: 'JTAG', type: 'debug', protocol: 'JTAG' },
  { pattern: /\bSWD\b/i, name: 'SWD', type: 'debug', protocol: 'SWD' },
  { pattern: /\bMIPI\b/i, name: 'MIPI', type: 'serial', protocol: 'MIPI' },
  { pattern: /\bPCIe\b/i, name: 'PCIe', type: 'connector', protocol: 'PCIe' },
  { pattern: /\bSATA\b/i, name: 'SATA', type: 'connector', protocol: 'SATA' },
];

function generateFallbackSpec(summarizedIntake: string, projectName?: string): FallbackSpecResult {
  const lines = summarizedIntake.split('\n').filter((l) => l.trim().length > 0 && !l.startsWith('==='));

  const requirements: z.infer<typeof RequirementSchema>[] = [];
  const constraints: z.infer<typeof ConstraintSchema>[] = [];
  const interfaces: z.infer<typeof InterfaceSpecSchema>[] = [];

  let reqId = 1;
  let conId = 1;
  let ifaceId = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('===')) continue;

    // Extract numeric values with units as constraints
    const quantityMatches = trimmed.matchAll(/(\d+(?:\.\d+)?)\s*(V|A|W|Hz|MHz|GHz|mm|cm|inch|°C|°F|mils?)/gi);
    for (const match of quantityMatches) {
      const value = match[1];
      const unit = match[2];
      if (!value || !unit) continue;
      
      let constraintType = 'dimensional';
      if (/V/i.test(unit)) constraintType = 'voltage';
      else if (/A/i.test(unit)) constraintType = 'current';
      else if (/W/i.test(unit)) constraintType = 'power';
      else if (/Hz|MHz|GHz/i.test(unit)) constraintType = 'frequency';
      else if (/°C|°F/i.test(unit)) constraintType = 'temperature';

      constraints.push({
        id: `fallback-con-${conId++}`,
        type: constraintType,
        value,
        unit,
        source: 'extracted_from_intake',
      });
    }

    // Detect connectors/interfaces
    for (const cp of CONNECTOR_PATTERNS) {
      if (cp.pattern.test(trimmed)) {
        // Avoid duplicates
        if (!interfaces.some((i) => i.name === cp.name)) {
          interfaces.push({
            id: `fallback-if-${ifaceId++}`,
            name: cp.name,
            type: cp.type,
            protocol: cp.protocol,
            notes: 'Detected from intake conversation',
          });
        }
      }
    }

    // Categorize lines as requirements based on keywords
    let category: z.infer<typeof RequirementSchema>['category'] = 'functional';
    if (/voltage|current|power|frequency|speed|bandwidth/i.test(trimmed)) category = 'performance';
    else if (/size|dimension|mm|cm|inch|weight|fit/i.test(trimmed)) category = 'physical';
    else if (/temperature|humidity|environmental|ip\d/i.test(trimmed)) category = 'environmental';
    else if (/rohs|ce|fcc|ul|regulatory|certification/i.test(trimmed)) category = 'regulatory';
    else if (/assembly|smt|through.?hole|pcb|layer|manufactur/i.test(trimmed)) category = 'manufacturing';

    let priority: z.infer<typeof RequirementSchema>['priority'] = 'should';
    if (/\bmust\b|\brequired?\b/i.test(trimmed)) priority = 'must';
    else if (/\bcould\b|\boptional\b|\bnice.?to.?have\b/i.test(trimmed)) priority = 'could';

    requirements.push({
      id: `fallback-req-${reqId++}`,
      category,
      description: trimmed,
      priority,
      rationale: 'Extracted from intake conversation (LLM fallback)',
    });
  }

  const summary = projectName
    ? `Preliminary specification for ${projectName} generated from intake data. ` +
      `Contains ${requirements.length} requirements, ${constraints.length} constraints, and ${interfaces.length} interfaces. ` +
      `This is an auto-generated fallback spec — the user should review and refine it.`
    : `Preliminary specification generated from intake data. ` +
      `Contains ${requirements.length} requirements, ${constraints.length} constraints, and ${interfaces.length} interfaces. ` +
      `This is an auto-generated fallback spec — the user should review and refine it.`;

  return { summary, requirements, constraints, interfaces };
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
          const provider = new KimiProvider(50_000);  // 50s — must stay under Vercel Hobby 60s limit
          const isAvailable = await provider.isAvailable();
          console.log('[api/spec/compile] Provider available:', isAvailable);

          const gateway = new LLMGateway(provider, { maxRetries: 1 });  // Reduced retries for Vercel timeout budget
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
          // LLM failed or timed out — generate fallback spec from intake data
          console.warn('[api/spec/compile] LLM call failed, generating fallback spec from intake:', err instanceof Error ? err.message : String(err));

          const fallback = generateFallbackSpec(summarizedIntake, project.name);
          specContent = fallback.summary;
          structuredRequirements = fallback.requirements;
          structuredConstraints = fallback.constraints;
          structuredInterfaces = fallback.interfaces;

          console.log('[api/spec/compile] Fallback spec generated. Requirements:', fallback.requirements.length, 'Constraints:', fallback.constraints.length, 'Interfaces:', fallback.interfaces.length);

          try {
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
              action: 'spec_compiled_fallback',
              actor: auth.user.id,
              details: { specId: spec.id, fallback: true, reason: err instanceof Error ? err.message : 'Unknown error' },
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
                  status: 'compiled_fallback',
                }),
              ),
            );
          } catch (dbErr) {
            // Fallback spec persistence also failed — report error to client
            console.error('[api/spec/compile] Fallback spec persistence failed:', dbErr);
            controller.enqueue(
              encoder.encode(
                sseEncode({
                  type: 'error',
                  error: 'Spec compilation failed and fallback could not be saved. Please try again.',
                }),
              ),
            );
          }
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
