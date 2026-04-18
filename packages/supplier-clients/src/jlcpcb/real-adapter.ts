import { createHash, randomUUID } from 'node:crypto';
import type { SearchOptions } from '../common/adapter.js';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types.js';
import type { JLCPCBAdapter } from './adapter.js';
import { FetchHttpClient, HttpError } from '../common/http-client.js';
import { resolvePrice, round2, parseLeadWeeks, mapLifecycleStatus } from '../common/helpers.js';

export interface JLCPCBConfig {
  appId: string;
  accessKey: string;
  secretKey: string;
}

interface JLCPCBComponent {
  productId: number;
  productCode: string;
  productName: string;
  productIntro: string;
  manufacturerName: string;
  parentCatalogName: string;
  encapsulation: string;
  stockNumber: number;
  productPriceList: Array<{
    startNumber: number;
    productPrice: number;
  }>;
  pdfUrl: string;
  leadTime: string;
  isBasic: boolean;
  isExtend: boolean;
  paramVOList: Array<{
    paramName: string;
    paramValue: string;
  }>;
}

interface JLCPCBSearchResponse {
  code: number;
  data: {
    tip: string;
    count: number;
    list: JLCPCBComponent[];
  };
}

interface JLCPCBDetailResponse {
  code: number;
  data: JLCPCBComponent;
}

export class RealJLCPCBAdapter implements JLCPCBAdapter {
  readonly name = 'JLCPCB';
  private readonly http: FetchHttpClient;
  private readonly config: JLCPCBConfig;

  constructor(config: JLCPCBConfig, http?: FetchHttpClient) {
    this.config = config;
    this.http = http ?? new FetchHttpClient('https://ips.lcsc.com/rest/wmsc2agent/');
  }

  isEstimateOnly(): boolean {
    return false;
  }

  async isAvailable(): Promise<boolean> {
    return (
      this.config.appId.length > 0 &&
      this.config.accessKey.length > 0 &&
      this.config.secretKey.length > 0
    );
  }

  private signParams(): Record<string, string> {
    const timestamp = Date.now().toString();
    const nonce = randomUUID();
    const signature = createHash('md5')
      .update(timestamp + nonce + this.config.secretKey)
      .digest('hex');
    return {
      key: this.config.accessKey,
      timestamp,
      nonce,
      signature,
    };
  }

  private authParams(params?: Record<string, string>): Record<string, string> {
    return { ...this.signParams(), ...params };
  }

  async searchPart(query: string, options?: SearchOptions): Promise<SupplierSearchResult> {
    const params: Record<string, string> = { keyword: query };
    if (options?.maxResults && options.maxResults > 0) {
      params.pageSize = String(options.maxResults);
    }

    const response = await this.withRetry(() =>
      this.http.get<JLCPCBSearchResponse>('product/search', { params: this.authParams(params) }),
    );

    let components = response.data?.list ?? [];

    if (options?.category) {
      const cat = options.category.toLowerCase();
      components = components.filter(
        (c) => c.parentCatalogName?.toLowerCase().includes(cat) ?? false,
      );
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      components = components.filter(
        (c) => c.manufacturerName?.toLowerCase().includes(mfr) ?? false,
      );
    }
    if (options?.inStockOnly) {
      components = components.filter((c) => c.stockNumber > 0);
    }
    if (options?.maxResults && options.maxResults > 0) {
      components = components.slice(0, options.maxResults);
    }

    return {
      supplier: this.name,
      query,
      results: components.map((c) => this.mapComponent(c)),
      totalResults: response.data?.count ?? components.length,
      isEstimate: false,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    // Try product detail by product code first
    try {
      const response = await this.withRetry(() =>
        this.http.get<JLCPCBDetailResponse>('product/detail', {
          params: this.authParams({ productCode: skuOrMpn }),
        }),
      );
      if (response.data) {
        return this.mapComponent(response.data);
      }
    } catch {
      // Not a product code — fall back to search
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
      currency: items[0]?.currency ?? 'CNY',
      estimatedLeadTime: `${maxLeadWeeks} weeks`,
      validUntil: Date.now() + 24 * 60 * 60 * 1000,
      isEstimate: false,
    };
  }

  async getComponentSpecs(jlcpcbPartId: string): Promise<{
    partId: string;
    mpn: string;
    package: string;
    specs: Record<string, string>;
  } | null> {
    try {
      const response = await this.withRetry(() =>
        this.http.get<JLCPCBDetailResponse>('product/detail', {
          params: this.authParams({ productCode: jlcpcbPartId }),
        }),
      );

      if (!response.data) return null;
      const comp = response.data;

      return {
        partId: comp.productCode,
        mpn: comp.productName,
        package: comp.encapsulation || 'Unknown',
        specs: Object.fromEntries(comp.paramVOList.map((p) => [p.paramName, p.paramValue])),
      };
    } catch {
      return null;
    }
  }

  async isInBasicLibrary(mpn: string): Promise<boolean> {
    const part = await this.findComponentByMpn(mpn);
    return part?.isBasic ?? false;
  }

  async isInExtendedLibrary(mpn: string): Promise<boolean> {
    const part = await this.findComponentByMpn(mpn);
    return part?.isExtend ?? false;
  }

  private async findComponentByMpn(mpn: string): Promise<JLCPCBComponent | null> {
    const response = await this.withRetry(() =>
      this.http.get<JLCPCBSearchResponse>('product/search', {
        params: this.authParams({ keyword: mpn, pageSize: '1' }),
      }),
    );

    const key = mpn.toLowerCase();
    const exactMatch = response.data?.list?.find(
      (c) => c.productName?.toLowerCase() === key || c.productCode?.toLowerCase() === key,
    );
    return exactMatch ?? response.data?.list?.[0] ?? null;
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 429) {
          throw new Error(`JLCPCB API rate limit exceeded: ${error.body.slice(0, 100)}`, {
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

  private mapComponent(comp: JLCPCBComponent): SupplierPartInfo {
    const breakpoints = comp.productPriceList?.map((pp) => ({
      quantity: pp.startNumber,
      price: pp.productPrice,
    }));

    return {
      supplier: this.name,
      supplierSku: comp.productCode,
      manufacturer: comp.manufacturerName,
      mpn: comp.productName,
      description: comp.productIntro,
      category: comp.parentCatalogName,
      packageType: comp.encapsulation,
      lifecycle: mapLifecycleStatus(undefined),
      stock: comp.stockNumber,
      stockUpdatedAt: Date.now(),
      unitPrice: breakpoints?.[0]?.price ?? null,
      currency: 'CNY',
      moq: null,
      breakpoints,
      datasheetUrl: comp.pdfUrl,
      leadTime: comp.leadTime,
      isEstimate: false,
    };
  }
}
