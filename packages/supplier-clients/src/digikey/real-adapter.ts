import type { SearchOptions } from '../common/adapter';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types';
import type { DigiKeyAdapter } from './adapter';
import { FetchHttpClient, HttpError } from '../common/http-client';
import { resolvePrice, round2, parseLeadWeeks, mapLifecycleStatus } from '../common/helpers';
import {
  DigiKeyCategoriesResponseSchema,
  DigiKeyProductSchema,
  DigiKeySearchResponseSchema,
  DigiKeyTokenResponseSchema,
} from '../common/response-schemas';

export interface DigiKeyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox?: boolean;
}

export class RealDigiKeyAdapter implements DigiKeyAdapter {
  readonly name = 'DigiKey';
  private readonly http: FetchHttpClient;
  private readonly config: DigiKeyConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: DigiKeyConfig, http?: FetchHttpClient) {
    this.config = config;
    const baseUrl = config.sandbox ? 'https://sandbox-api.digikey.com' : 'https://api.digikey.com';
    this.http = http ?? new FetchHttpClient(baseUrl);
  }

  isEstimateOnly(): boolean {
    return false;
  }

  async isAvailable(): Promise<boolean> {
    return this.config.clientId.length > 0 && this.config.clientSecret.length > 0;
  }

  async searchPart(query: string, options?: SearchOptions): Promise<SupplierSearchResult> {
    const params: Record<string, string> = { keyword: query };
    if (options?.maxResults && options.maxResults > 0) {
      params.limit = String(options.maxResults);
    }

    const raw = await this.authenticatedGet<unknown>('/products/v4/search/keyword', params);
    const parsed = DigiKeySearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error('DigiKey search response validation failed:', parsed.error.flatten());
      return {
        supplier: this.name,
        query,
        results: [],
        totalResults: 0,
        isEstimate: false,
      };
    }

    let products = parsed.data.Products ?? [];

    if (options?.category) {
      const cat = options.category.toLowerCase();
      products = products.filter((p) => {
        const prod = p as Record<string, unknown>;
        const categoryName = (prod.Category as Record<string, unknown> | undefined)?.Name;
        return typeof categoryName === 'string' && categoryName.toLowerCase().includes(cat);
      });
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      products = products.filter((p) => {
        const prod = p as Record<string, unknown>;
        const mfrName = (prod.Manufacturer as Record<string, unknown> | undefined)?.Name;
        return typeof mfrName === 'string' && mfrName.toLowerCase().includes(mfr);
      });
    }
    if (options?.inStockOnly) {
      products = products.filter((p) => {
        const qty = (p as Record<string, unknown>).QuantityAvailable;
        return typeof qty === 'number' && qty > 0;
      });
    }
    if (options?.maxResults && options.maxResults > 0) {
      products = products.slice(0, options.maxResults);
    }

    const mapped = products
      .map((p) => this.mapProduct(p))
      .filter((p): p is SupplierPartInfo => p !== null);

    return {
      supplier: this.name,
      query,
      results: mapped,
      totalResults: parsed.data.ProductsCount ?? mapped.length,
      isEstimate: false,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    try {
      const raw = await this.authenticatedGet<unknown>('/products/v4/product/details', {
        digikeypartnumber: skuOrMpn,
      });
      const parsed = DigiKeyProductSchema.safeParse(raw);
      if (!parsed.success) {
        console.error('DigiKey product detail validation failed:', parsed.error.flatten());
      } else {
        return this.mapProduct(parsed.data);
      }
    } catch {
      // Not a DigiKey part number — fall back to keyword search
    }

    const searchResult = await this.searchPart(skuOrMpn, { maxResults: 1 });
    const key = skuOrMpn.toLowerCase();
    const exactMatch = searchResult.results.find(
      (p) => p.supplierSku.toLowerCase() === key || p.mpn.toLowerCase() === key,
    );
    return exactMatch ?? searchResult.results[0] ?? null;
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

  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    const raw = await this.authenticatedGet<unknown>('/products/v4/categories');
    const parsed = DigiKeyCategoriesResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error('DigiKey categories response validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data.Categories.map((c) => ({
      id: String(c.CategoryId),
      name: c.Name,
    }));
  }

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const raw = await this.http.postForm<unknown>('/v1/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const parsed = DigiKeyTokenResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error('DigiKey token response validation failed:', parsed.error.flatten());
      throw new Error('Invalid DigiKey token response');
    }

    this.accessToken = parsed.data.access_token;
    this.tokenExpiresAt = Date.now() + (parsed.data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  private async authenticatedGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.withRetry(async () => {
      const token = await this.ensureToken();
      return this.http.get<T>(path, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-DIGIKEY-Client-Id': this.config.clientId,
        },
        params,
      });
    });
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 401) {
          this.accessToken = null;
          return fn();
        }
        if (error.status === 429) {
          throw new Error(`DigiKey API rate limit exceeded: ${error.body.slice(0, 100)}`, {
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

  private mapProduct(product: unknown): SupplierPartInfo | null {
    const parsed = DigiKeyProductSchema.safeParse(product);
    if (!parsed.success) {
      console.error('DigiKey product validation failed:', parsed.error.flatten());
      return null;
    }

    const p = parsed.data;
    return {
      supplier: this.name,
      supplierSku: p.DigiKeyPartNumber,
      manufacturer: p.Manufacturer.Name,
      mpn: p.ManufacturerPartNumber,
      description: p.ProductDescription,
      category: p.Category.Name,
      packageType: p.PackageType.Name || undefined,
      lifecycle: mapLifecycleStatus(p.ProductStatus),
      stock: p.QuantityAvailable,
      stockUpdatedAt: Date.now(),
      unitPrice: p.UnitPrice,
      currency: p.Currency,
      moq: p.MinimumOrderQuantity,
      breakpoints: p.StandardPricing.map((bp) => ({
        quantity: bp.BreakQuantity,
        price: bp.UnitPrice ?? 0,
      })),
      datasheetUrl: p.PrimaryDatasheet || undefined,
      leadTime: p.LeadTime || undefined,
      isEstimate: false,
    };
  }
}
