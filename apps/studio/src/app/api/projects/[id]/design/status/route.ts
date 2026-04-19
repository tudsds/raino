import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { prisma } from '@raino/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const job = await prisma.designJob.findFirst({
      where: { projectId: id, jobType: 'DESIGN' },
      orderBy: { createdAt: 'desc' },
    });

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
      createdAt: job.createdAt.toISOString(),
      startedAt: job.startedAt?.toISOString() ?? null,
      completedAt: job.completedAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch design status' }, { status: 400 });
  }
}
