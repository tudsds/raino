import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { prisma } from '@raino/db';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import {
  updateIngestionStatus,
  updateIngestionSufficiencyReport,
} from '@/lib/data/ingestion-queries';
import { runSufficiencyGate } from '@raino/core';
import type { IngestionState } from '@raino/core';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const manifest = await prisma.ingestionManifest.findUnique({ where: { projectId: id } });

    if (!manifest) {
      await prisma.ingestionManifest.create({
        data: {
          projectId: id,
          status: 'running',
          candidateFamilies: [],
          stages: [
            { name: 'datasheet_fetch', status: 'in_progress' },
            { name: 'errata_check', status: 'pending' },
            { name: 'app_note_fetch', status: 'pending' },
            { name: 'chunking', status: 'pending' },
            { name: 'embedding', status: 'pending' },
            { name: 'sufficiency_gate', status: 'pending' },
          ],
        },
      });
    } else {
      await updateIngestionStatus(id, 'running');
    }

    await updateProjectStatus(id, 'candidates_discovered');

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'ingestion_run_started',
      actor: auth.user.id,
    });

    const runId = manifest?.id ?? `run-${Date.now()}`;

    const currentManifest = await prisma.ingestionManifest.findUnique({ where: { projectId: id } });
    if (currentManifest) {
      const ingestionState: IngestionState = {
        stages: currentManifest.stages as IngestionState['stages'],
        candidateFamilies: currentManifest.candidateFamilies as IngestionState['candidateFamilies'],
      };

      const sufficiencyReport = runSufficiencyGate(id, ingestionState);

      await updateIngestionSufficiencyReport(
        id,
        sufficiencyReport as unknown as Record<string, unknown>,
      );

      await createAuditEntry(id, {
        category: 'ingestion',
        action: 'sufficiency_gate_evaluated',
        actor: 'system',
        details: {
          overallPass: sufficiencyReport.overallPass,
          gaps: sufficiencyReport.gaps,
          checkCount: sufficiencyReport.checks.length,
        },
      });
    }

    return NextResponse.json({
      projectId: id,
      runId,
      status: 'started',
      message: 'Ingestion pipeline started',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to start ingestion run' }, { status: 400 });
  }
}
