import { createSupplierAdapters, HttpError, type SupplierAdapter } from '@raino/supplier-clients';

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
  adapter: SupplierAdapter,
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
  } catch (error) {
    const errorInfo = {
      supplier: adapter.name,
      query: input.mpn,
      error: error instanceof Error ? error.message : String(error),
      type:
        error instanceof HttpError
          ? error.status === 404
            ? 'part_not_found'
            : error.status === 429
              ? 'rate_limited'
              : error.status >= 500
                ? 'api_error'
                : 'auth_error'
          : 'unknown_error',
      timestamp: new Date().toISOString(),
    };
    console.error('[supplier-comparison]', JSON.stringify(errorInfo));
    return null;
  }
}

async function queryAllSuppliers(
  input: SupplierPriceInput,
  adapters: SupplierAdapter[],
): Promise<SupplierQuoteResult[]> {
  const results = await Promise.all(adapters.map((adapter) => querySingleSupplier(input, adapter)));
  return results.filter((r): r is SupplierQuoteResult => r !== null);
}

export function selectBestQuote(quotes: SupplierQuoteResult[]): {
  bestPrice: number | null;
  bestSupplier: string | null;
} {
  const valid = quotes.filter((q) => q.price !== null && q.price > 0);
  if (valid.length === 0) {
    return { bestPrice: null, bestSupplier: null };
  }

  const sorted = [...valid].sort((a, b) => a.price - b.price);
  const best = sorted[0]!;
  return { bestPrice: best.price, bestSupplier: best.supplier };
}

export async function aggregateSupplierPrices(
  inputs: SupplierPriceInput[],
): Promise<SupplierPriceResult[]> {
  const adapters = createSupplierAdapters();
  const results: SupplierPriceResult[] = [];

  for (const input of inputs) {
    const allQuotes = await queryAllSuppliers(input, adapters);
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
