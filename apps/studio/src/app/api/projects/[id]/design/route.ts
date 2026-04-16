import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { createDesignJob } from '@/lib/data/artifact-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { updateProjectStatus } from '@/lib/data/project-queries';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const job = await createDesignJob(id, 'DESIGN');

    await updateProjectStatus(id, 'design_generated');

    await createAuditEntry(id, {
      category: 'design',
      action: 'design_job_created',
      actor: auth.user.id,
      details: { jobId: job.id, jobType: 'DESIGN' },
    });

    return NextResponse.json({
      projectId: id,
      designId: job.id,
      status: job.status,
      message: 'Design generation job queued',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create design job' }, { status: 400 });
  }
}
