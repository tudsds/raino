import type { SupplierPartInfo, SupplierQuote, SupplierSearchResult } from './types.js';

export interface SearchOptions {
  category?: string;
  manufacturer?: string;
  inStockOnly?: boolean;
  maxResults?: number;
}

export interface SupplierAdapter {
  readonly name: string;

  searchPart(query: string, options?: SearchOptions): Promise<SupplierSearchResult>;

  getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null>;

  getQuote(lineItems: Array<{ sku: string; quantity: number }>): Promise<SupplierQuote>;

  isAvailable(): Promise<boolean>;

  isEstimateOnly(): boolean;
}
