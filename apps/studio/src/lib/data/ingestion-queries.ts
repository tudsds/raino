import { prisma } from '@raino/db';
import type { Prisma } from '@raino/db';

export async function getIngestionManifest(projectId: string) {
  return prisma.ingestionManifest.findUnique({
    where: { projectId },
  });
}

export async function createIngestionManifest(
  projectId: string,
  data: {
    status: string;
    candidateFamilies: Record<string, unknown>[];
    stages: Record<string, unknown>[];
  },
) {
  const existing = await prisma.ingestionManifest.findUnique({ where: { projectId } });
  if (existing) {
    return prisma.ingestionManifest.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        candidateFamilies: data.candidateFamilies as Prisma.InputJsonValue,
        stages: data.stages as Prisma.InputJsonValue,
      },
    });
  }

  return prisma.ingestionManifest.create({
    data: {
      projectId,
      status: data.status,
      candidateFamilies: data.candidateFamilies as Prisma.InputJsonValue,
      stages: data.stages as Prisma.InputJsonValue,
    },
  });
}

export async function updateIngestionStatus(projectId: string, status: string) {
  return prisma.ingestionManifest.update({
    where: { projectId },
    data: { status },
  });
}

export async function updateIngestionSufficiencyReport(
  projectId: string,
  report: Record<string, unknown>,
) {
  return prisma.ingestionManifest.update({
    where: { projectId },
    data: { sufficiencyReport: report as Prisma.InputJsonValue },
  });
}
