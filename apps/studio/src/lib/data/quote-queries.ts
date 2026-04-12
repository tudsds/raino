import { prisma } from '@raino/db';

export async function getQuote(projectId: string) {
  return prisma.quote.findFirst({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createQuote(
  projectId: string,
  data: {
    lowQuote: number;
    midQuote: number;
    highQuote: number;
    confidence: string;
    currency: string;
    assumptions: string[];
    breakdown: Array<{ label: string; value: number }>;
    isEstimate: boolean;
    quantity: number;
  },
) {
  return prisma.quote.create({
    data: {
      projectId,
      lowQuote: data.lowQuote,
      midQuote: data.midQuote,
      highQuote: data.highQuote,
      confidence: data.confidence,
      currency: data.currency,
      assumptions: data.assumptions,
      breakdown: data.breakdown,
      isEstimate: data.isEstimate,
      quantity: data.quantity,
    },
  });
}
