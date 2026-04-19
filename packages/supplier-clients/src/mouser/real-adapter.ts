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
import { MouserPartSchema, MouserSearchResponseSchema } from '../common/response-schemas.js';

export interface MouserConfig {
  apiKey: string;
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

    const raw = await this.withRetry(() => this.http.get<unknown>('search/keyword', { params }));
    const parsed = MouserSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error('Mouser search response validation failed:', parsed.error.flatten());
      return {
        supplier: this.name,
        query,
        results: [],
        totalResults: 0,
        isEstimate: false,
      };
    }

    let parts = parsed.data.SearchResults.Parts;

    if (options?.category) {
      const cat = options.category.toLowerCase();
      parts = parts.filter((p) => {
        const category = (p as Record<string, unknown>).Category;
        return typeof category === 'string' && category.toLowerCase().includes(cat);
      });
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      parts = parts.filter((p) => {
        const manufacturer = (p as Record<string, unknown>).Manufacturer;
        return typeof manufacturer === 'string' && manufacturer.toLowerCase().includes(mfr);
      });
    }
    if (options?.inStockOnly) {
      parts = parts.filter((p) => {
        const availability = (p as Record<string, unknown>).Availability;
        return typeof availability === 'string' && this.parseStock(availability) > 0;
      });
    }
    if (options?.maxResults && options.maxResults > 0) {
      parts = parts.slice(0, options.maxResults);
    }

    const mapped = parts
      .map((p) => this.mapPart(p))
      .filter((p): p is SupplierPartInfo => p !== null);

    return {
      supplier: this.name,
      query,
      results: mapped,
      totalResults: parsed.data.SearchResults.NumberOfResult ?? mapped.length,
      isEstimate: false,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    const params: Record<string, string> = {
      apiKey: this.config.apiKey,
      partNumber: skuOrMpn,
    };

    try {
      const raw = await this.withRetry(() =>
        this.http.get<unknown>('search/partnumber', { params }),
      );
      const parsed = MouserSearchResponseSchema.safeParse(raw);
      if (!parsed.success) {
        console.error('Mouser part info response validation failed:', parsed.error.flatten());
        return null;
      }

      const parts = parsed.data.SearchResults.Parts;
      if (parts.length === 0) return null;

      const key = skuOrMpn.toLowerCase();
      const exactMatch = parts.find((p) => {
        const mpn = (p as Record<string, unknown>).MouserPartNumber;
        const mfrPn = (p as Record<string, unknown>).ManufacturerPartNumber;
        return (
          (typeof mpn === 'string' && mpn.toLowerCase() === key) ||
          (typeof mfrPn === 'string' && mfrPn.toLowerCase() === key)
        );
      });
      const selected = exactMatch ?? parts[0];
      return selected ? this.mapPart(selected) : null;
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
      if (unitPrice === null || unitPrice <= 0) continue;

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
          throw new Error(`Mouser API rate limit exceeded: ${error.body.slice(0, 100)}`, {
            cause: error,
          });
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

  private mapPart(part: unknown): SupplierPartInfo | null {
    const parsed = MouserPartSchema.safeParse(part);
    if (!parsed.success) {
      console.error('Mouser part validation failed:', parsed.error.flatten());
      return null;
    }

    const p = parsed.data;
    const breakpoints = p.PriceBreaks.map((pb) => ({
      quantity: pb.Quantity,
      price: parseFloat(pb.Price) || 0,
    }));

    const currency = p.PriceBreaks[0]?.Currency ?? 'USD';

    return {
      supplier: this.name,
      supplierSku: p.MouserPartNumber,
      manufacturer: p.Manufacturer,
      mpn: p.ManufacturerPartNumber,
      description: p.ProductDescription,
      category: p.Category,
      packageType: p.PackageType || undefined,
      lifecycle: mapLifecycleStatus(p.LifecycleStatus),
      stock: this.parseStock(p.Availability),
      stockUpdatedAt: Date.now(),
      unitPrice: breakpoints[0]?.price ?? null,
      currency,
      moq: null,
      breakpoints,
      datasheetUrl: p.DataSheetUrl || undefined,
      leadTime: p.LeadTime || undefined,
      isEstimate: false,
    };
  }
}
