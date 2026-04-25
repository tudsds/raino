import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { KimiProvider, LLMGateway, templateToMessages } from '@raino/llm';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';

export const maxDuration = 60;

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
    const specText = project.spec?.raw_text ?? project.description ?? '';

    let archContent: string;
    try {
      const provider = new KimiProvider();
      const gateway = new LLMGateway(provider, { maxRetries: 1 });
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

    const db = getSupabaseAdmin();

    // Upsert architecture
    const { data: existing } = await db
      .from('architectures')
      .select('id')
      .eq('project_id', id)
      .maybeSingle();

    let architecture;
    if (existing) {
      const { data, error } = await db
        .from('architectures')
        .update({
          template_name: 'ai-recommended',
          rationale: archContent,
          updated_at: new Date().toISOString(),
        })
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
          template_name: 'AI Recommended',
          rationale: archContent,
          interfaces: [],
          features: [],
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
      details: { architectureId: architecture.id },
    });

    return NextResponse.json({
      projectId: id,
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
    });
  } catch (err) {
    console.error('[api/architecture/plan] Failed:', err);
    return NextResponse.json({ error: 'Failed to plan architecture' }, { status: 400 });
  }
}
