import { prisma } from '@raino/db';
import type { Prisma } from '@prisma/client';

export async function getArtifacts(projectId: string, artifactType?: string) {
  return prisma.designArtifact.findMany({
    where: {
      projectId,
      ...(artifactType ? { artifactType } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createDesignJob(
  projectId: string,
  jobType: string,
  input?: Record<string, unknown>,
) {
  return prisma.designJob.create({
    data: {
      projectId,
      jobType,
      status: 'pending',
      result: input as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getDesignJobs(projectId: string) {
  return prisma.designJob.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createHandoffRequest(
  projectId: string,
  data: {
    type: string;
    quantity: number;
    quoteId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  return prisma.handoffRequest.create({
    data: {
      projectId,
      type: data.type,
      quantity: data.quantity,
      quoteId: data.quoteId ?? null,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
