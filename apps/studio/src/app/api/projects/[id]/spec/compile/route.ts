import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';

export const maxDuration = 60;

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
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = ownership.project;

    const intakeMessages = project.intakeMessages.map((m) => `${m.role}: ${m.content}`).join('\n');

    let specContent = 'Specification compilation unavailable — AI service could not be reached.';
    let structuredRequirements: z.infer<typeof RequirementSchema>[] = [];
    let structuredConstraints: z.infer<typeof ConstraintSchema>[] = [];
    let structuredInterfaces: z.infer<typeof InterfaceSpecSchema>[] = [];

    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider);
      const messages = templateToMessages('spec_compilation', {
        intakeMessages,
        clarificationAnswers: '',
      });

      try {
        const structured = await gateway.chatStructured(messages, SpecOutputSchema);
        specContent = structured.summary;
        structuredRequirements = structured.requirements;
        structuredConstraints = structured.constraints;
        structuredInterfaces = structured.interfaces;
      } catch {
        const response = await gateway.chat(messages);
        specContent = response.content;
      }
    } catch {
      // intentionally empty — keep fallback specContent with empty structured fields
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

    return NextResponse.json({
      projectId: id,
      spec: {
        id: spec.id,
        rawText: spec.raw_text,
        requirements: spec.requirements,
        constraints: spec.constraints,
        interfaces: spec.interfaces,
        compiledAt: spec.compiled_at,
      },
      status: 'compiled',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to compile specification' }, { status: 400 });
  }
}
