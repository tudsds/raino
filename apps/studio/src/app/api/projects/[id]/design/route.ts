import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { dispatchDesignJob } from '@/lib/workers/dispatch';
import type { ProjectGenerationRequest, BomComponent } from '@raino/design-worker';

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

    if (!project.bom || project.bom.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'BOM must be generated before design. Call POST /api/projects/:id/bom/generate first.',
        },
        { status: 422 },
      );
    }

    const bomComponents: BomComponent[] = project.bom.rows.map((row) => ({
      reference: row.ref,
      value: row.value,
      mpn: row.mpn,
      footprint: row.package,
      symbol: '',
      manufacturer: row.manufacturer,
      quantity: row.quantity,
    }));

    const generateRequest: ProjectGenerationRequest = {
      projectId: id,
      projectName: project.name,
      bom: bomComponents,
      architecture: {
        name: project.architecture?.template_name ?? 'generic',
        processorType: project.architecture?.mcu ?? 'unknown',
        powerTopology: project.architecture?.power ?? 'unknown',
        interfaceSet: Array.isArray(project.architecture?.interfaces)
          ? (project.architecture!.interfaces as string[])
          : [],
        referenceTopology: {},
      },
    };

    const { jobId, status, triggered } = await dispatchDesignJob(
      id,
      'DESIGN',
      generateRequest as unknown as Record<string, unknown>,
    );

    await updateProjectStatus(id, 'design_running');

    await createAuditEntry(id, {
      category: 'design',
      action: 'design_job_queued',
      actor: auth.user.id,
      details: { jobId, jobType: 'DESIGN' },
    });

    const warning = !triggered
      ? 'GITHUB_ACTIONS_DISPATCH_TOKEN is not configured. The design job is queued but will not be dispatched to GitHub Actions. Set GITHUB_ACTIONS_DISPATCH_TOKEN to enable automatic execution.'
      : undefined;

    return NextResponse.json(
      {
        projectId: id,
        jobId,
        status,
        message: 'Design job queued',
        warning,
      },
      { status: 202 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to queue design job' }, { status: 400 });
  }
}
