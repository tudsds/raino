import { prisma } from '@raino/db';
import type { Prisma } from '@raino/db';

export async function getAuditEntries(projectId: string) {
  return prisma.auditEntry.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAuditEntry(
  projectId: string,
  data: {
    category: string;
    action: string;
    actor: string;
    details?: Record<string, unknown>;
    severity?: string;
    source?: string;
  },
) {
  return prisma.auditEntry.create({
    data: {
      projectId,
      category: data.category,
      action: data.action,
      actor: data.actor,
      details: data.details as Prisma.InputJsonValue | undefined,
      severity: data.severity ?? 'info',
      source: data.source ?? 'studio-api',
    },
  });
}
