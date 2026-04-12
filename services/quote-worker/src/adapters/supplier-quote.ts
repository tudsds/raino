export interface SupplierPriceInput {
  mpn: string;
  quantity: number;
}

export interface SupplierQuoteResult {
  supplier: string;
  price: number;
  inStock: boolean;
  isEstimate: boolean;
}

export interface SupplierPriceResult {
  mpn: string;
  bestPrice: number | null;
  bestSupplier: string | null;
  allQuotes: SupplierQuoteResult[];
  isEstimate: boolean;
}

import { createSupplierAdapters, type SupplierAdapter } from '@raino/supplier-clients';

export interface SupplierAdapterLike {
  name: string;
  getPartInfo: (mpn: string) => Promise<unknown>;
}

interface PartInfoFields {
  unitPrice?: number | null;
  stock?: number;
  isEstimate?: boolean;
}

function extractPartInfo(raw: unknown): PartInfoFields {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    return {
      unitPrice: typeof obj['unitPrice'] === 'number' ? obj['unitPrice'] : null,
      stock: typeof obj['stock'] === 'number' ? obj['stock'] : 0,
      isEstimate: typeof obj['isEstimate'] === 'boolean' ? obj['isEstimate'] : true,
    };
  }
  return { unitPrice: null, stock: 0, isEstimate: true };
}

async function querySingleSupplier(
  input: SupplierPriceInput,
  adapter: SupplierAdapterLike,
): Promise<SupplierQuoteResult | null> {
  try {
    const raw = await adapter.getPartInfo(input.mpn);
    const info = extractPartInfo(raw);

    if (info.unitPrice === null || info.unitPrice === undefined) {
      return null;
    }

    return {
      supplier: adapter.name,
      price: info.unitPrice,
      inStock: (info.stock ?? 0) >= input.quantity,
      isEstimate: info.isEstimate ?? true,
    };
  } catch {
    return null;
  }
}

async function queryAllSuppliers(
  input: SupplierPriceInput,
  adapters: SupplierAdapterLike[],
): Promise<SupplierQuoteResult[]> {
  const results = await Promise.all(adapters.map((adapter) => querySingleSupplier(input, adapter)));
  return results.filter((r): r is SupplierQuoteResult => r !== null);
}

function selectBestQuote(quotes: SupplierQuoteResult[]): {
  bestPrice: number | null;
  bestSupplier: string | null;
} {
  if (quotes.length === 0) {
    return { bestPrice: null, bestSupplier: null };
  }

  const sorted = [...quotes].sort((a, b) => a.price - b.price);
  const best = sorted[0]!;
  return {
    bestPrice: best.price,
    bestSupplier: best.supplier,
  };
}

function wrapSupplierAdapter(adapter: SupplierAdapter): SupplierAdapterLike {
  return {
    name: adapter.name,
    getPartInfo: async (mpn: string) => {
      const result = await adapter.getPartInfo(mpn);
      return result;
    },
  };
}

export function createQuoteAdapters(): SupplierAdapterLike[] {
  const adapters = createSupplierAdapters();
  return adapters.map(wrapSupplierAdapter);
}

export async function aggregateSupplierPrices(
  inputs: SupplierPriceInput[],
  adapters?: SupplierAdapterLike[],
): Promise<SupplierPriceResult[]> {
  const resolvedAdapters = adapters ?? createQuoteAdapters();
  const results: SupplierPriceResult[] = [];

  for (const input of inputs) {
    const allQuotes = await queryAllSuppliers(input, resolvedAdapters);
    const { bestPrice, bestSupplier } = selectBestQuote(allQuotes);
    const isEstimate = allQuotes.length === 0 || allQuotes.some((q) => q.isEstimate);

    results.push({
      mpn: input.mpn,
      bestPrice,
      bestSupplier,
      allQuotes,
      isEstimate,
    });
  }

  return results;
}
