import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import { createDesignJob } from '@/lib/data/artifact-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { generateKiCadProject } from '@raino/design-worker';
import type { ProjectGenerationRequest, BomComponent } from '@raino/design-worker';
import { prisma } from '@raino/db';

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
      footprint: row.pkg,
      symbol: '',
      manufacturer: row.manufacturer,
      quantity: row.quantity,
    }));

    const generateRequest: ProjectGenerationRequest = {
      projectId: id,
      projectName: project.name,
      bom: bomComponents,
      architecture: {
        name: project.architecture?.templateName ?? 'generic',
        processorType: project.architecture?.mcu ?? 'unknown',
        powerTopology: project.architecture?.power ?? 'unknown',
        interfaceSet: Array.isArray(project.architecture?.interfaces)
          ? (project.architecture!.interfaces as string[])
          : [],
        referenceTopology: {},
      },
    };

    const job = await createDesignJob(
      id,
      'DESIGN',
      generateRequest as unknown as Record<string, unknown>,
    );

    await updateProjectStatus(id, 'design_running');

    await createAuditEntry(id, {
      category: 'design',
      action: 'design_job_created',
      actor: auth.user.id,
      details: { jobId: job.id, jobType: 'DESIGN' },
    });

    await prisma.designJob.update({
      where: { id: job.id },
      data: { status: 'running', startedAt: new Date(), progress: 10 },
    });

    let result;
    try {
      result = generateKiCadProject(generateRequest);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await prisma.designJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: errorMsg,
          completedAt: new Date(),
          progress: 0,
        },
      });
      await updateProjectStatus(id, 'design_failed');
      await createAuditEntry(id, {
        category: 'design',
        action: 'design_job_failed',
        actor: auth.user.id,
        details: { jobId: job.id, error: errorMsg },
        severity: 'error',
      });
      return NextResponse.json(
        {
          projectId: id,
          designId: job.id,
          status: 'failed',
          error: errorMsg,
        },
        { status: 500 },
      );
    }

    const finalStatus = result.success ? 'completed' : 'failed';
    await prisma.designJob.update({
      where: { id: job.id },
      data: {
        status: finalStatus,
        progress: result.success ? 100 : 0,
        result: JSON.parse(JSON.stringify(result)),
        error: result.errors.join('; ') || null,
        completedAt: new Date(),
      },
    });

    const projectStatus = result.success ? 'design_completed' : 'design_failed';
    await updateProjectStatus(id, projectStatus);

    await createAuditEntry(id, {
      category: 'design',
      action: result.success ? 'design_job_completed' : 'design_job_failed',
      actor: auth.user.id,
      details: {
        jobId: job.id,
        projectPath: result.projectPath,
        duration: result.duration,
        warningCount: result.warnings.length,
        errorCount: result.errors.length,
      },
      severity: result.success ? 'info' : 'error',
    });

    const kicadCliPath = process.env.KICAD_CLI_PATH;
    const isPlaceholder = !kicadCliPath;

    return NextResponse.json({
      projectId: id,
      designId: job.id,
      status: finalStatus,
      result: {
        projectPath: result.projectPath,
        schematicPath: result.schematicPath,
        pcbPath: result.pcbPath,
        warnings: result.warnings,
        errors: result.errors,
        duration: result.duration,
        isPlaceholder,
      },
      message: isPlaceholder
        ? 'KiCad project generated in degraded mode (KICAD_CLI_PATH not set). Validation and export will return placeholder results.'
        : 'KiCad project generated successfully.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to execute design generation' }, { status: 400 });
  }
}
