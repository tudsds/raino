import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { verifyProjectOwnership } from '@/lib/data/project-queries';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const db = getSupabaseAdmin();
    const { data: job, error } = await db
      .from('design_jobs')
      .select('*')
      .eq('project_id', id)
      .eq('job_type', 'DESIGN')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!job) {
      return NextResponse.json({
        projectId: id,
        status: 'none',
        message: 'No design job found for this project.',
      });
    }

    return NextResponse.json({
      projectId: id,
      designId: job.id,
      status: job.status,
      progress: Number(job.progress),
      result: job.result,
      error: job.error,
      createdAt: job.created_at,
      startedAt: job.started_at ?? null,
      completedAt: job.completed_at ?? null,
    });
  } catch (err) {
    console.error('[api/design/status] Failed:', err);
    return NextResponse.json({ error: 'Failed to fetch design status' }, { status: 400 });
  }
}
