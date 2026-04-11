import { describe, it, expect } from 'vitest';
import { MockDigiKeyAdapter } from '../digikey/adapter.js';
import { MockMouserAdapter } from '../mouser/adapter.js';
import { MockJLCPCBAdapter } from '../jlcpcb/adapter.js';

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
