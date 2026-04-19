import { createHash, randomUUID } from 'node:crypto';
import type { SearchOptions } from '../common/adapter';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types';
import type { JLCPCBAdapter } from './adapter';
import { FetchHttpClient, HttpError } from '../common/http-client';
import { resolvePrice, round2, parseLeadWeeks, mapLifecycleStatus } from '../common/helpers';
import {
  JLCPCBComponentSchema,
  JLCPCBDetailResponseSchema,
  JLCPCBSearchResponseSchema,
} from '../common/response-schemas';

export interface JLCPCBConfig {
  appId: string;
  accessKey: string;
  secretKey: string;
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

    const raw = await this.withRetry(() =>
      this.http.get<unknown>('product/search', { params: this.authParams(params) }),
    );
    const parsed = JLCPCBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error('JLCPCB search response validation failed:', parsed.error.flatten());
      return {
        supplier: this.name,
        query,
        results: [],
        totalResults: 0,
        isEstimate: false,
      };
    }

    let components = parsed.data.data.list;

    if (options?.category) {
      const cat = options.category.toLowerCase();
      components = components.filter((c) => {
        const parentCatalogName = (c as Record<string, unknown>).parentCatalogName;
        return (
          typeof parentCatalogName === 'string' && parentCatalogName.toLowerCase().includes(cat)
        );
      });
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      components = components.filter((c) => {
        const manufacturerName = (c as Record<string, unknown>).manufacturerName;
        return typeof manufacturerName === 'string' && manufacturerName.toLowerCase().includes(mfr);
      });
    }
    if (options?.inStockOnly) {
      components = components.filter((c) => {
        const stockNumber = (c as Record<string, unknown>).stockNumber;
        return typeof stockNumber === 'number' && stockNumber > 0;
      });
    }
    if (options?.maxResults && options.maxResults > 0) {
      components = components.slice(0, options.maxResults);
    }

    const mapped = components
      .map((c) => this.mapComponent(c))
      .filter((c): c is SupplierPartInfo => c !== null);

    return {
      supplier: this.name,
      query,
      results: mapped,
      totalResults: parsed.data.data.count ?? mapped.length,
      isEstimate: false,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    try {
      const raw = await this.withRetry(() =>
        this.http.get<unknown>('product/detail', {
          params: this.authParams({ productCode: skuOrMpn }),
        }),
      );
      const parsed = JLCPCBDetailResponseSchema.safeParse(raw);
      if (parsed.success && parsed.data.data) {
        const compParsed = JLCPCBComponentSchema.safeParse(parsed.data.data);
        if (compParsed.success) {
          return this.mapComponent(compParsed.data);
        }
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
      const raw = await this.withRetry(() =>
        this.http.get<unknown>('product/detail', {
          params: this.authParams({ productCode: jlcpcbPartId }),
        }),
      );
      const parsed = JLCPCBDetailResponseSchema.safeParse(raw);
      if (!parsed.success || !parsed.data.data) return null;

      const compParsed = JLCPCBComponentSchema.safeParse(parsed.data.data);
      if (!compParsed.success) {
        console.error('JLCPCB component specs validation failed:', compParsed.error.flatten());
        return null;
      }
      const comp = compParsed.data;

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

  private async findComponentByMpn(
    mpn: string,
  ): Promise<{ isBasic: boolean; isExtend: boolean } | null> {
    const raw = await this.withRetry(() =>
      this.http.get<unknown>('product/search', {
        params: this.authParams({ keyword: mpn, pageSize: '1' }),
      }),
    );
    const parsed = JLCPCBSearchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        'JLCPCB findComponentByMpn response validation failed:',
        parsed.error.flatten(),
      );
      return null;
    }

    const list = parsed.data.data.list;
    const key = mpn.toLowerCase();
    const exactMatch = list.find((c) => {
      const productName = (c as Record<string, unknown>).productName;
      const productCode = (c as Record<string, unknown>).productCode;
      return (
        (typeof productName === 'string' && productName.toLowerCase() === key) ||
        (typeof productCode === 'string' && productCode.toLowerCase() === key)
      );
    });
    const selected = exactMatch ?? list[0];
    if (!selected) return null;

    const compParsed = JLCPCBComponentSchema.safeParse(selected);
    if (!compParsed.success) {
      console.error(
        'JLCPCB findComponentByMpn component validation failed:',
        compParsed.error.flatten(),
      );
      return null;
    }
    return compParsed.data;
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

  private mapComponent(comp: unknown): SupplierPartInfo | null {
    const parsed = JLCPCBComponentSchema.safeParse(comp);
    if (!parsed.success) {
      console.error('JLCPCB component validation failed:', parsed.error.flatten());
      return null;
    }

    const c = parsed.data;
    const breakpoints = c.productPriceList.map((pp) => ({
      quantity: pp.startNumber,
      price: pp.productPrice ?? 0,
    }));

    return {
      supplier: this.name,
      supplierSku: c.productCode,
      manufacturer: c.manufacturerName,
      mpn: c.productName,
      description: c.productIntro,
      category: c.parentCatalogName,
      packageType: c.encapsulation || undefined,
      lifecycle: mapLifecycleStatus(undefined),
      stock: c.stockNumber,
      stockUpdatedAt: Date.now(),
      unitPrice: breakpoints[0]?.price ?? null,
      currency: 'CNY',
      moq: null,
      breakpoints,
      datasheetUrl: c.pdfUrl || undefined,
      leadTime: c.leadTime || undefined,
      isEstimate: false,
    };
  }
}
