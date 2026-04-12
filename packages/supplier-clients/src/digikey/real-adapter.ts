import type { SearchOptions } from '../common/adapter.js';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types.js';
import type { DigiKeyAdapter } from './adapter.js';
import { FetchHttpClient, HttpError } from '../common/http-client.js';
import { resolvePrice, round2, parseLeadWeeks, mapLifecycleStatus } from '../common/helpers.js';

export interface DigiKeyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox?: boolean;
}

interface DigiKeyTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface DigiKeyProduct {
  DigiKeyPartNumber?: string;
  Manufacturer?: { Name?: string };
  ManufacturerPartNumber?: string;
  ProductDescription?: string;
  Category?: { Name?: string };
  PackageType?: { Name?: string };
  ProductStatus?: string;
  QuantityAvailable?: number;
  UnitPrice?: number;
  Currency?: string;
  MinimumOrderQuantity?: number;
  StandardPricing?: Array<{ BreakQuantity?: number; UnitPrice?: number }>;
  PrimaryDatasheet?: string;
  LeadTime?: string;
}

interface DigiKeySearchResponse {
  Products?: DigiKeyProduct[];
  ProductsCount?: number;
}

interface DigiKeyCategoriesResponse {
  Categories?: Array<{ CategoryId?: number; Name?: string }>;
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

    const response = await this.authenticatedGet<DigiKeySearchResponse>(
      '/products/v4/search/keyword',
      params,
    );

    let products = response.Products ?? [];

    if (options?.category) {
      const cat = options.category.toLowerCase();
      products = products.filter((p) => p.Category?.Name?.toLowerCase().includes(cat) ?? false);
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      products = products.filter((p) => p.Manufacturer?.Name?.toLowerCase().includes(mfr) ?? false);
    }
    if (options?.inStockOnly) {
      products = products.filter((p) => (p.QuantityAvailable ?? 0) > 0);
    }
    if (options?.maxResults && options.maxResults > 0) {
      products = products.slice(0, options.maxResults);
    }

    return {
      supplier: this.name,
      query,
      results: products.map((p) => this.mapProduct(p)),
      totalResults: response.ProductsCount ?? products.length,
      isEstimate: false,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    try {
      const response = await this.authenticatedGet<DigiKeyProduct>('/products/v4/product/details', {
        digikeypartnumber: skuOrMpn,
      });
      return this.mapProduct(response);
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
    const response =
      await this.authenticatedGet<DigiKeyCategoriesResponse>('/products/v4/categories');

    return (response.Categories ?? []).map((c) => ({
      id: String(c.CategoryId ?? ''),
      name: c.Name ?? '',
    }));
  }

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await this.http.postForm<DigiKeyTokenResponse>('/v1/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    this.accessToken = response.access_token;
    // Refresh 60 seconds before actual expiry
    this.tokenExpiresAt = Date.now() + (response.expires_in - 60) * 1000;

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
          throw new Error(`DigiKey API rate limit exceeded: ${error.body.slice(0, 100)}`);
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

  private mapProduct(product: DigiKeyProduct): SupplierPartInfo {
    return {
      supplier: this.name,
      supplierSku: product.DigiKeyPartNumber ?? '',
      manufacturer: product.Manufacturer?.Name ?? '',
      mpn: product.ManufacturerPartNumber ?? '',
      description: product.ProductDescription ?? '',
      category: product.Category?.Name ?? '',
      packageType: product.PackageType?.Name,
      lifecycle: mapLifecycleStatus(product.ProductStatus),
      stock: product.QuantityAvailable ?? 0,
      stockUpdatedAt: Date.now(),
      unitPrice: product.UnitPrice ?? null,
      currency: product.Currency ?? 'USD',
      moq: product.MinimumOrderQuantity ?? null,
      breakpoints: product.StandardPricing?.map((bp) => ({
        quantity: bp.BreakQuantity ?? 0,
        price: bp.UnitPrice ?? 0,
      })),
      datasheetUrl: product.PrimaryDatasheet,
      leadTime: product.LeadTime,
      isEstimate: false,
    };
  }
}
