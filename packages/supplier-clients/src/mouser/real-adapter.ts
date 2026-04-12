import type { SearchOptions } from '../common/adapter.js';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types.js';
import type { MouserAdapter } from './adapter.js';
import { FetchHttpClient, HttpError } from '../common/http-client.js';
import { resolvePrice, round2, parseLeadWeeks, mapLifecycleStatus } from '../common/helpers.js';

export interface MouserConfig {
  apiKey: string;
}

interface MouserSearchResponse {
  Errors?: Array<{ Code?: number; Message?: string }>;
  SearchResults?: {
    NumberOfResult?: number;
    Parts?: MouserPart[];
  };
}

interface MouserPart {
  MouserPartNumber?: string;
  Manufacturer?: string;
  ManufacturerPartNumber?: string;
  ProductDescription?: string;
  Category?: string;
  PackageType?: string;
  LifecycleStatus?: string;
  Availability?: string;
  PriceBreaks?: Array<{ Quantity?: number; Price?: string; Currency?: string }>;
  DataSheetUrl?: string;
  LeadTime?: string;
}

export class RealMouserAdapter implements MouserAdapter {
  readonly name = 'Mouser';
  private readonly http: FetchHttpClient;
  private readonly config: MouserConfig;

  constructor(config: MouserConfig, http?: FetchHttpClient) {
    this.config = config;
    this.http = http ?? new FetchHttpClient('https://api.mouser.com/api/v1');
  }

  isEstimateOnly(): boolean {
    return false;
  }

  async isAvailable(): Promise<boolean> {
    return this.config.apiKey.length > 0;
  }

  async searchPart(query: string, options?: SearchOptions): Promise<SupplierSearchResult> {
    const params: Record<string, string> = {
      apiKey: this.config.apiKey,
      keyword: query,
    };
    if (options?.maxResults && options.maxResults > 0) {
      params.limit = String(options.maxResults);
    }

    const response = await this.withRetry(() =>
      this.http.get<MouserSearchResponse>('search/keyword', { params }),
    );

    let parts = response.SearchResults?.Parts ?? [];

    if (options?.category) {
      const cat = options.category.toLowerCase();
      parts = parts.filter((p) => p.Category?.toLowerCase().includes(cat) ?? false);
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      parts = parts.filter((p) => p.Manufacturer?.toLowerCase().includes(mfr) ?? false);
    }
    if (options?.inStockOnly) {
      parts = parts.filter((p) => this.parseStock(p.Availability) > 0);
    }
    if (options?.maxResults && options.maxResults > 0) {
      parts = parts.slice(0, options.maxResults);
    }

    return {
      supplier: this.name,
      query,
      results: parts.map((p) => this.mapPart(p)),
      totalResults: response.SearchResults?.NumberOfResult ?? parts.length,
      isEstimate: false,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    const params: Record<string, string> = {
      apiKey: this.config.apiKey,
      partNumber: skuOrMpn,
    };

    try {
      const response = await this.withRetry(() =>
        this.http.get<MouserSearchResponse>('search/partnumber', { params }),
      );

      const parts = response.SearchResults?.Parts ?? [];
      if (parts.length === 0) return null;

      const key = skuOrMpn.toLowerCase();
      const exactMatch = parts.find(
        (p) =>
          p.MouserPartNumber?.toLowerCase() === key ||
          p.ManufacturerPartNumber?.toLowerCase() === key,
      );
      return this.mapPart(exactMatch ?? parts[0]!);
    } catch {
      return null;
    }
  }

  async getQuote(lineItems: Array<{ sku: string; quantity: number }>): Promise<SupplierQuote> {
    const items: SupplierQuoteLineItem[] = [];

    for (const li of lineItems) {
      const part = await this.getPartInfo(li.sku);
      if (!part) continue;

      const unitPrice = resolvePrice(part, li.quantity);
      const inStock = part.stock >= li.quantity;

      items.push({
        supplierSku: part.supplierSku,
        mpn: part.mpn,
        quantity: li.quantity,
        unitPrice,
        totalPrice: round2(unitPrice * li.quantity),
        currency: part.currency,
        leadTime: part.leadTime ?? 'TBD',
        inStock,
        isEstimate: false,
      });
    }

    const totalPrice = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const maxLeadWeeks = Math.max(...items.map((i) => parseLeadWeeks(i.leadTime)), 0);

    return {
      supplier: this.name,
      lineItems: items,
      totalPrice: round2(totalPrice),
      currency: items[0]?.currency ?? 'USD',
      estimatedLeadTime: `${maxLeadWeeks} weeks`,
      validUntil: Date.now() + 24 * 60 * 60 * 1000,
      isEstimate: false,
    };
  }

  getCartUrl(lineItems: Array<{ sku: string; quantity: number }>): string {
    if (lineItems.length === 0) return 'https://www.mouser.com/cart/';
    const params = lineItems.map((li) => `${encodeURIComponent(li.sku)}:${li.quantity}`).join('&');
    return `https://www.mouser.com/cart/?items=${params}`;
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 429) {
          throw new Error(`Mouser API rate limit exceeded: ${error.body.slice(0, 100)}`);
        }
        if (error.status >= 500) {
          await this.sleep(1000);
          return fn();
        }
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseStock(availability?: string): number {
    if (!availability) return 0;
    const match = availability.match(/(\d+)/);
    return match ? parseInt(match[1]!, 10) : 0;
  }

  private mapPart(part: MouserPart): SupplierPartInfo {
    const breakpoints = part.PriceBreaks?.map((pb) => ({
      quantity: pb.Quantity ?? 0,
      price: parseFloat(pb.Price ?? '0'),
    }));

    const currency = part.PriceBreaks?.[0]?.Currency ?? 'USD';

    return {
      supplier: this.name,
      supplierSku: part.MouserPartNumber ?? '',
      manufacturer: part.Manufacturer ?? '',
      mpn: part.ManufacturerPartNumber ?? '',
      description: part.ProductDescription ?? '',
      category: part.Category ?? '',
      packageType: part.PackageType,
      lifecycle: mapLifecycleStatus(part.LifecycleStatus),
      stock: this.parseStock(part.Availability),
      stockUpdatedAt: Date.now(),
      unitPrice: breakpoints?.[0]?.price ?? null,
      currency,
      moq: null,
      breakpoints,
      datasheetUrl: part.DataSheetUrl,
      leadTime: part.LeadTime,
      isEstimate: false,
    };
  }
}
