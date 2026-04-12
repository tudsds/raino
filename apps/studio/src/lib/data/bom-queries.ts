import { prisma } from '@raino/db';

export async function getBOM(projectId: string) {
  return prisma.bOM.findUnique({
    where: { projectId },
    include: { rows: true },
  });
}

export async function createBOM(
  projectId: string,
  data: {
    totalCost: number;
    currency: string;
    lineCount: number;
    isEstimate: boolean;
    rows: Array<{
      ref: string;
      value: string;
      mpn: string;
      manufacturer: string;
      pkg: string;
      quantity: number;
      unitPrice: number;
      currency: string;
      lifecycle: string;
      risk: string;
      description?: string;
    }>;
  },
) {
  // Delete existing BOM if present (project has unique constraint)
  const existing = await prisma.bOM.findUnique({ where: { projectId } });
  if (existing) {
    await prisma.bOMRow.deleteMany({ where: { bomId: existing.id } });
    await prisma.bOM.delete({ where: { id: existing.id } });
  }

  return prisma.bOM.create({
    data: {
      projectId,
      totalCost: data.totalCost,
      currency: data.currency,
      lineCount: data.lineCount,
      isEstimate: data.isEstimate,
      rows: {
        create: data.rows.map((row) => ({
          ref: row.ref,
          value: row.value,
          mpn: row.mpn,
          manufacturer: row.manufacturer,
          pkg: row.pkg,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          currency: row.currency,
          lifecycle: row.lifecycle,
          risk: row.risk,
          description: row.description ?? null,
        })),
      },
    },
    include: { rows: true },
  });
}
