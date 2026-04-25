import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/** Transform Supabase snake_case row to camelCase for API consumers. */
function toCamelCase(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    // Convert snake_case keys to camelCase
    const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = value;
  }
  return out;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create client inside handler so env vars are available at runtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { id } = await params;
    console.log('Fetching project with ID (Supabase Direct):', id);

    const { data: project, error } = await supabase
      .from('projects')
      .select('*, organization:organizations(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch intake messages for the project
    const { data: intakeMessages } = await supabase
      .from('intake_messages')
      .select('id, role, content, created_at, thinking')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    const result = toCamelCase(project) as Record<string, unknown>;
    if (!result.currentStep) {
      const STATUS_TO_STEP: Record<string, number> = {
        intake: 0, clarifying: 1, spec_compiled: 2, architecture_planned: 3,
        candidates_discovered: 4, ingested: 5, bom_generated: 6, design_running: 7,
        validated: 8, completed: 9, quoted: 10,
      };
      const status = result.status as string;
      result.currentStep = STATUS_TO_STEP[status] ?? 0;
      result.totalSteps = 12;
    }

    // Include intake messages mapped to camelCase
    result.intakeMessages = (intakeMessages ?? []).map((msg: Record<string, unknown>) =>
      toCamelCase(msg)
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Unexpected error in project API:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
