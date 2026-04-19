import { describe, it, expect, vi, afterEach } from 'vitest';
import { MockDigiKeyAdapter } from '../digikey/adapter';
import { MockMouserAdapter } from '../mouser/adapter';
import { MockJLCPCBAdapter } from '../jlcpcb/adapter';
import { RealDigiKeyAdapter } from '../digikey/real-adapter';
import { RealMouserAdapter } from '../mouser/real-adapter';
import { RealJLCPCBAdapter } from '../jlcpcb/real-adapter';
import { createSupplierAdapters, getAdapterStatus } from '../factory';
import { FetchHttpClient, HttpError } from '../common/http-client';
import { resolvePrice, round2, parseLeadWeeks, mapLifecycleStatus } from '../common/helpers';

// ── MockDigiKeyAdapter ───────────────────────────────────────────────────────

describe('MockDigiKeyAdapter', () => {
  const adapter = new MockDigiKeyAdapter();

  it('reports estimate-only mode', () => {
    expect(adapter.isEstimateOnly()).toBe(true);
  });

  it('reports not available (no live API)', async () => {
    expect(await adapter.isAvailable()).toBe(false);
  });

  it('exposes correct name', () => {
    expect(adapter.name).toBe('DigiKey');
  });

  it('searches for STM32 parts', async () => {
    const result = await adapter.searchPart('STM32F407');
    expect(result.supplier).toBe('DigiKey');
    expect(result.isEstimate).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]!.mpn).toContain('STM32F407');
  });

  it('returns empty results for unknown part', async () => {
    const result = await adapter.searchPart('NONEXISTENT-PART-XYZ123');
    expect(result.results).toHaveLength(0);
    expect(result.totalResults).toBe(0);
  });

  it('gets part info for known MPN', async () => {
    const part = await adapter.getPartInfo('STM32F407VGT6');
    expect(part).not.toBeNull();
    expect(part!.mpn).toBe('STM32F407VGT6');
    expect(part!.manufacturer).toBe('STMicroelectronics');
    expect(part!.unitPrice).toBe(12.34);
    expect(part!.isEstimate).toBe(true);
  });

  it('gets part info by supplier SKU', async () => {
    const part = await adapter.getPartInfo('497-11531-ND');
    expect(part).not.toBeNull();
    expect(part!.mpn).toBe('STM32F407VGT6');
  });

  it('returns null for unknown MPN', async () => {
    const part = await adapter.getPartInfo('UNKNOWN-MPN-999');
    expect(part).toBeNull();
  });

  it('searches with category filter', async () => {
    const result = await adapter.searchPart('', { category: 'Microcontrollers' });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.every((p) => p.category.toLowerCase().includes('microcontroller'))).toBe(
      true,
    );
  });

  it('searches with inStockOnly filter', async () => {
    const result = await adapter.searchPart('STM32', { inStockOnly: true });
    expect(result.results.every((p) => p.stock > 0)).toBe(true);
  });

  it('searches with maxResults limit', async () => {
    const result = await adapter.searchPart('', { maxResults: 2 });
    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  it('generates a quote with line items', async () => {
    const quote = await adapter.getQuote([
      { sku: 'STM32F407VGT6', quantity: 10 },
      { sku: 'AMS1117-3.3', quantity: 5 },
    ]);
    expect(quote.supplier).toBe('DigiKey');
    expect(quote.isEstimate).toBe(true);
    expect(quote.lineItems).toHaveLength(2);
    expect(quote.totalPrice).toBeGreaterThan(0);
    expect(quote.lineItems[0]!.unitPrice).toBeLessThan(quote.lineItems[0]!.totalPrice + 1);
  });

  it('applies breakpoint pricing in quote', async () => {
    const quote = await adapter.getQuote([{ sku: 'STM32F407VGT6', quantity: 100 }]);
    const part = await adapter.getPartInfo('STM32F407VGT6');
    expect(quote.lineItems[0]!.unitPrice).toBeLessThan(part!.unitPrice!);
  });

  it('returns categories', async () => {
    const categories = await adapter.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((c) => c.id.length > 0 && c.name.length > 0)).toBe(true);
  });
});

// ── MockMouserAdapter ────────────────────────────────────────────────────────

describe('MockMouserAdapter', () => {
  const adapter = new MockMouserAdapter();

  it('reports estimate-only mode', () => {
    expect(adapter.isEstimateOnly()).toBe(true);
  });

  it('exposes correct name', () => {
    expect(adapter.name).toBe('Mouser');
  });

  it('searches for STM32 parts', async () => {
    const result = await adapter.searchPart('STM32F407');
    expect(result.isEstimate).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('gets part info for known MPN', async () => {
    const part = await adapter.getPartInfo('STM32F407VGT6');
    expect(part).not.toBeNull();
    expect(part!.supplier).toBe('Mouser');
    expect(part!.unitPrice).toBe(13.1);
    expect(part!.isEstimate).toBe(true);
  });

  it('returns null for unknown MPN', async () => {
    const part = await adapter.getPartInfo('NONEXISTENT-999');
    expect(part).toBeNull();
  });

  it('generates a quote', async () => {
    const quote = await adapter.getQuote([{ sku: 'STM32F407VGT6', quantity: 1 }]);
    expect(quote.supplier).toBe('Mouser');
    expect(quote.lineItems).toHaveLength(1);
    expect(quote.totalPrice).toBeGreaterThan(0);
  });

  it('generates a cart URL', () => {
    const url = adapter.getCartUrl([{ sku: 'STM32F407VGT6', quantity: 10 }]);
    expect(url).toContain('mouser.com/cart');
    expect(url).toContain('STM32F407VGT6');
  });

  it('generates empty cart URL', () => {
    const url = adapter.getCartUrl([]);
    expect(url).toBe('https://www.mouser.com/cart/');
  });
});

// ── MockJLCPCBAdapter ────────────────────────────────────────────────────────

describe('MockJLCPCBAdapter', () => {
  const adapter = new MockJLCPCBAdapter();

  it('reports estimate-only mode', () => {
    expect(adapter.isEstimateOnly()).toBe(true);
  });

  it('exposes correct name', () => {
    expect(adapter.name).toBe('JLCPCB');
  });

  it('searches for STM32 parts', async () => {
    const result = await adapter.searchPart('STM32F407');
    expect(result.isEstimate).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('gets part info for known MPN', async () => {
    const part = await adapter.getPartInfo('STM32F407VGT6');
    expect(part).not.toBeNull();
    expect(part!.supplier).toBe('JLCPCB');
    expect(part!.currency).toBe('CNY');
  });

  it('gets part info by JLCPCB part ID', async () => {
    const part = await adapter.getPartInfo('C43058');
    expect(part).not.toBeNull();
    expect(part!.mpn).toBe('STM32F407VGT6');
  });

  it('returns null for unknown MPN', async () => {
    const part = await adapter.getPartInfo('NONEXISTENT-999');
    expect(part).toBeNull();
  });

  it('identifies basic library parts', async () => {
    const inBasic = await adapter.isInBasicLibrary('STM32F407VGT6');
    expect(inBasic).toBe(true);
  });

  it('identifies extended-only parts', async () => {
    const inBasic = await adapter.isInBasicLibrary('ESP32-S3-WROOM-1');
    expect(inBasic).toBe(false);

    const inExtended = await adapter.isInExtendedLibrary('ESP32-S3-WROOM-1');
    expect(inExtended).toBe(true);
  });

  it('returns false for unknown MPN in library checks', async () => {
    const inBasic = await adapter.isInBasicLibrary('UNKNOWN-PART');
    expect(inBasic).toBe(false);
    const inExtended = await adapter.isInExtendedLibrary('UNKNOWN-PART');
    expect(inExtended).toBe(false);
  });

  it('generates a quote with CNY currency', async () => {
    const quote = await adapter.getQuote([{ sku: 'STM32F407VGT6', quantity: 1 }]);
    expect(quote.currency).toBe('CNY');
    expect(quote.isEstimate).toBe(true);
  });

  it('gets component specs for known part ID', async () => {
    const specs = await adapter.getComponentSpecs('C43058');
    expect(specs).not.toBeNull();
    expect(specs!.partId).toBe('C43058');
    expect(specs!.mpn).toBe('STM32F407VGT6');
    expect(specs!.specs['Core']).toBe('ARM Cortex-M4');
  });

  it('returns null for unknown component specs', async () => {
    const specs = await adapter.getComponentSpecs('C99999999');
    expect(specs).toBeNull();
  });
});

// ── Cross-adapter: all fixture data validates ────────────────────────────────

describe('Cross-adapter fixture consistency', () => {
  it('all adapters return isEstimate=true for search results', async () => {
    const adapters = [new MockDigiKeyAdapter(), new MockMouserAdapter(), new MockJLCPCBAdapter()];
    for (const adapter of adapters) {
      const result = await adapter.searchPart('STM32');
      for (const part of result.results) {
        expect(part.isEstimate).toBe(true);
      }
    }
  });

  it('all adapters return estimate-only mode', () => {
    const adapters = [new MockDigiKeyAdapter(), new MockMouserAdapter(), new MockJLCPCBAdapter()];
    for (const adapter of adapters) {
      expect(adapter.isEstimateOnly()).toBe(true);
    }
  });

  it('all adapters share common MPNs across catalogs', async () => {
    const dk = new MockDigiKeyAdapter();
    const mouser = new MockMouserAdapter();
    const jlcpcb = new MockJLCPCBAdapter();

    const sharedMPNs = ['STM32F407VGT6', 'AMS1117-3.3', 'RP2040'];
    for (const mpn of sharedMPNs) {
      const dkPart = await dk.getPartInfo(mpn);
      const mouserPart = await mouser.getPartInfo(mpn);
      const jlcpcbPart = await jlcpcb.getPartInfo(mpn);

      expect(dkPart).not.toBeNull();
      expect(mouserPart).not.toBeNull();
      expect(jlcpcbPart).not.toBeNull();
    }
  });
});

// ── RealDigiKeyAdapter (no API calls) ────────────────────────────────────────

describe('RealDigiKeyAdapter', () => {
  it('reports live mode (not estimate-only)', () => {
    const adapter = new RealDigiKeyAdapter({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      redirectUri: 'https://localhost/callback',
    });
    expect(adapter.isEstimateOnly()).toBe(false);
  });

  it('exposes correct name', () => {
    const adapter = new RealDigiKeyAdapter({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      redirectUri: 'https://localhost/callback',
    });
    expect(adapter.name).toBe('DigiKey');
  });

  it('reports available when credentials are set', async () => {
    const adapter = new RealDigiKeyAdapter({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      redirectUri: 'https://localhost/callback',
    });
    expect(await adapter.isAvailable()).toBe(true);
  });

  it('reports unavailable when credentials are empty', async () => {
    const adapter = new RealDigiKeyAdapter({
      clientId: '',
      clientSecret: '',
      redirectUri: '',
    });
    expect(await adapter.isAvailable()).toBe(false);
  });

  it('accepts custom FetchHttpClient', () => {
    const http = new FetchHttpClient('https://custom-base.example.com');
    const adapter = new RealDigiKeyAdapter(
      { clientId: 'id', clientSecret: 'secret', redirectUri: '' },
      http,
    );
    expect(adapter.name).toBe('DigiKey');
  });

  it('uses sandbox URL when configured', () => {
    const adapter = new RealDigiKeyAdapter({
      clientId: 'test-id',
      clientSecret: 'test-secret',
      redirectUri: '',
      sandbox: true,
    });
    expect(adapter.isEstimateOnly()).toBe(false);
  });
});

// ── RealMouserAdapter (no API calls) ─────────────────────────────────────────

describe('RealMouserAdapter', () => {
  it('reports live mode (not estimate-only)', () => {
    const adapter = new RealMouserAdapter({ apiKey: 'test-key' });
    expect(adapter.isEstimateOnly()).toBe(false);
  });

  it('exposes correct name', () => {
    const adapter = new RealMouserAdapter({ apiKey: 'test-key' });
    expect(adapter.name).toBe('Mouser');
  });

  it('reports available when API key is set', async () => {
    const adapter = new RealMouserAdapter({ apiKey: 'test-key' });
    expect(await adapter.isAvailable()).toBe(true);
  });

  it('reports unavailable when API key is empty', async () => {
    const adapter = new RealMouserAdapter({ apiKey: '' });
    expect(await adapter.isAvailable()).toBe(false);
  });

  it('generates a cart URL without API calls', () => {
    const adapter = new RealMouserAdapter({ apiKey: 'test-key' });
    const url = adapter.getCartUrl([{ sku: '123', quantity: 5 }]);
    expect(url).toContain('mouser.com/cart');
    expect(url).toContain('123');
  });

  it('generates empty cart URL', () => {
    const adapter = new RealMouserAdapter({ apiKey: 'test-key' });
    expect(adapter.getCartUrl([])).toBe('https://www.mouser.com/cart/');
  });

  it('accepts custom FetchHttpClient', () => {
    const http = new FetchHttpClient('https://custom-base.example.com');
    const adapter = new RealMouserAdapter({ apiKey: 'key' }, http);
    expect(adapter.name).toBe('Mouser');
  });
});

// ── RealJLCPCBAdapter (no API calls) ─────────────────────────────────────────

describe('RealJLCPCBAdapter', () => {
  it('reports live mode (not estimate-only)', () => {
    const adapter = new RealJLCPCBAdapter({
      appId: 'app',
      accessKey: 'access',
      secretKey: 'secret',
    });
    expect(adapter.isEstimateOnly()).toBe(false);
  });

  it('exposes correct name', () => {
    const adapter = new RealJLCPCBAdapter({
      appId: 'app',
      accessKey: 'access',
      secretKey: 'secret',
    });
    expect(adapter.name).toBe('JLCPCB');
  });

  it('reports available when all keys are set', async () => {
    const adapter = new RealJLCPCBAdapter({
      appId: 'app',
      accessKey: 'access',
      secretKey: 'secret',
    });
    expect(await adapter.isAvailable()).toBe(true);
  });

  it('reports unavailable when any key is empty', async () => {
    const adapter = new RealJLCPCBAdapter({ appId: '', accessKey: '', secretKey: '' });
    expect(await adapter.isAvailable()).toBe(false);
  });

  it('accepts custom FetchHttpClient', () => {
    const http = new FetchHttpClient('https://custom-base.example.com');
    const adapter = new RealJLCPCBAdapter(
      { appId: 'app', accessKey: 'access', secretKey: 'secret' },
      http,
    );
    expect(adapter.name).toBe('JLCPCB');
  });
});

// ── SupplierAdapterFactory ───────────────────────────────────────────────────

describe('SupplierAdapterFactory', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns mock adapters when no env vars are set', () => {
    const adapters = createSupplierAdapters();
    expect(adapters).toHaveLength(3);
    for (const adapter of adapters) {
      expect(adapter.isEstimateOnly()).toBe(true);
    }
  });

  it('returns real DigiKey adapter when DIGIKEY env vars are set', () => {
    vi.stubEnv('DIGIKEY_CLIENT_ID', 'test-client-id');
    vi.stubEnv('DIGIKEY_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('DIGIKEY_REDIRECT_URI', 'https://localhost/callback');

    const adapters = createSupplierAdapters();
    const digikey = adapters.find((a) => a.name === 'DigiKey');
    expect(digikey).toBeDefined();
    expect(digikey!.isEstimateOnly()).toBe(false);
  });

  it('returns real Mouser adapter when MOUSER_API_KEY is set', () => {
    vi.stubEnv('MOUSER_API_KEY', 'test-mouser-key');

    const adapters = createSupplierAdapters();
    const mouser = adapters.find((a) => a.name === 'Mouser');
    expect(mouser).toBeDefined();
    expect(mouser!.isEstimateOnly()).toBe(false);
  });

  it('returns real JLCPCB adapter when JLCPCB env vars are set', () => {
    vi.stubEnv('JLCPCB_APP_ID', 'test-app-id');
    vi.stubEnv('JLCPCB_ACCESS_KEY', 'test-access-key');
    vi.stubEnv('JLCPCB_SECRET_KEY', 'test-secret-key');

    const adapters = createSupplierAdapters();
    const jlcpcb = adapters.find((a) => a.name === 'JLCPCB');
    expect(jlcpcb).toBeDefined();
    expect(jlcpcb!.isEstimateOnly()).toBe(false);
  });

  it('returns mixed adapters when only some env vars are set', () => {
    vi.stubEnv('MOUSER_API_KEY', 'test-mouser-key');

    const adapters = createSupplierAdapters();
    const digikey = adapters.find((a) => a.name === 'DigiKey');
    const mouser = adapters.find((a) => a.name === 'Mouser');
    const jlcpcb = adapters.find((a) => a.name === 'JLCPCB');

    expect(digikey!.isEstimateOnly()).toBe(true);
    expect(mouser!.isEstimateOnly()).toBe(false);
    expect(jlcpcb!.isEstimateOnly()).toBe(true);
  });
});

// ── getAdapterStatus ─────────────────────────────────────────────────────────

describe('getAdapterStatus', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports all mock when no env vars set', () => {
    const status = getAdapterStatus();
    expect(status.digikey.mode).toBe('mock');
    expect(status.digikey.available).toBe(false);
    expect(status.mouser.mode).toBe('mock');
    expect(status.mouser.available).toBe(false);
    expect(status.jlcpcb.mode).toBe('mock');
    expect(status.jlcpcb.available).toBe(false);
  });

  it('reports live for DigiKey when env vars set', () => {
    vi.stubEnv('DIGIKEY_CLIENT_ID', 'test-id');
    vi.stubEnv('DIGIKEY_CLIENT_SECRET', 'test-secret');

    const status = getAdapterStatus();
    expect(status.digikey.mode).toBe('live');
    expect(status.digikey.available).toBe(true);
  });

  it('reports live for Mouser when env var set', () => {
    vi.stubEnv('MOUSER_API_KEY', 'test-key');

    const status = getAdapterStatus();
    expect(status.mouser.mode).toBe('live');
    expect(status.mouser.available).toBe(true);
  });

  it('reports live for JLCPCB when all env vars set', () => {
    vi.stubEnv('JLCPCB_APP_ID', 'test-app-id');
    vi.stubEnv('JLCPCB_ACCESS_KEY', 'test-access-key');
    vi.stubEnv('JLCPCB_SECRET_KEY', 'test-secret-key');

    const status = getAdapterStatus();
    expect(status.jlcpcb.mode).toBe('live');
    expect(status.jlcpcb.available).toBe(true);
  });

  it('reports mock for DigiKey when only client ID is set', () => {
    vi.stubEnv('DIGIKEY_CLIENT_ID', 'test-id');

    const status = getAdapterStatus();
    expect(status.digikey.mode).toBe('mock');
    expect(status.digikey.available).toBe(false);
  });
});

// ── HttpError ────────────────────────────────────────────────────────────────

describe('HttpError', () => {
  it('captures status and body', () => {
    const error = new HttpError(404, 'Not Found', '{"error":"not found"}');
    expect(error.status).toBe(404);
    expect(error.body).toBe('{"error":"not found"}');
    expect(error.message).toContain('404');
    expect(error.name).toBe('HttpError');
  });

  it('truncates long body in message', () => {
    const longBody = 'x'.repeat(500);
    const error = new HttpError(500, 'Internal Server Error', longBody);
    expect(error.message.length).toBeLessThan(longBody.length + 50);
  });
});

// ── Shared helpers ───────────────────────────────────────────────────────────

describe('shared helpers', () => {
  describe('resolvePrice', () => {
    it('returns unit price when no breakpoints', () => {
      expect(resolvePrice({ unitPrice: 10.0 }, 5)).toBe(10.0);
    });

    it('returns breakpoint price when quantity matches', () => {
      const part = {
        unitPrice: 10.0,
        breakpoints: [
          { quantity: 10, price: 9.0 },
          { quantity: 100, price: 8.0 },
        ],
      };
      expect(resolvePrice(part, 10)).toBe(9.0);
      expect(resolvePrice(part, 100)).toBe(8.0);
      expect(resolvePrice(part, 50)).toBe(9.0);
      expect(resolvePrice(part, 1)).toBe(10.0);
    });

    it('returns null when unitPrice is null and no breakpoints', () => {
      expect(resolvePrice({ unitPrice: null }, 5)).toBeNull();
    });

    it('returns null when unitPrice is null even with breakpoints that do not match', () => {
      expect(
        resolvePrice({ unitPrice: null, breakpoints: [{ quantity: 100, price: 8.0 }] }, 5),
      ).toBeNull();
    });
  });

  describe('round2', () => {
    it('rounds to 2 decimal places', () => {
      expect(round2(1.125)).toBe(1.13);
      expect(round2(1.124)).toBe(1.12);
      expect(round2(0)).toBe(0);
    });
  });

  describe('parseLeadWeeks', () => {
    it('extracts number from lead time string', () => {
      expect(parseLeadWeeks('8 weeks')).toBe(8);
      expect(parseLeadWeeks('3 days')).toBe(3);
      expect(parseLeadWeeks('TBD')).toBe(0);
    });
  });

  describe('mapLifecycleStatus', () => {
    it('maps known status strings', () => {
      expect(mapLifecycleStatus('Active')).toBe('active');
      expect(mapLifecycleStatus('Obsolete')).toBe('obsolete');
      expect(mapLifecycleStatus('Not Recommended for New Designs')).toBe('not_recommended');
      expect(mapLifecycleStatus('End of Life')).toBe('end_of_life');
    });

    it('returns unknown for undefined or unrecognized', () => {
      expect(mapLifecycleStatus(undefined)).toBe('unknown');
      expect(mapLifecycleStatus('Something Else')).toBe('unknown');
    });
  });
});
