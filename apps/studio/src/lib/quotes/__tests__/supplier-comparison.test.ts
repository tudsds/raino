import { describe, it, expect } from 'vitest';
import { selectBestQuote, type SupplierQuoteResult } from '../supplier-comparison';

describe('selectBestQuote', () => {
  it('returns the lowest positive price among suppliers', () => {
    const quotes: SupplierQuoteResult[] = [
      { supplier: 'DigiKey', price: 12.5, inStock: true, isEstimate: false },
      { supplier: 'Mouser', price: 11.0, inStock: true, isEstimate: false },
      { supplier: 'JLCPCB', price: 13.0, inStock: false, isEstimate: false },
    ];

    const result = selectBestQuote(quotes);
    expect(result.bestPrice).toBe(11.0);
    expect(result.bestSupplier).toBe('Mouser');
  });

  it('skips quotes with $0 price', () => {
    const quotes: SupplierQuoteResult[] = [
      { supplier: 'DigiKey', price: 0, inStock: true, isEstimate: false },
      { supplier: 'Mouser', price: 11.0, inStock: true, isEstimate: false },
    ];

    const result = selectBestQuote(quotes);
    expect(result.bestPrice).toBe(11.0);
    expect(result.bestSupplier).toBe('Mouser');
  });

  it('skips quotes with negative price', () => {
    const quotes: SupplierQuoteResult[] = [
      { supplier: 'DigiKey', price: -5, inStock: true, isEstimate: false },
      { supplier: 'Mouser', price: 11.0, inStock: true, isEstimate: false },
    ];

    const result = selectBestQuote(quotes);
    expect(result.bestPrice).toBe(11.0);
    expect(result.bestSupplier).toBe('Mouser');
  });

  it('returns null when all prices are $0', () => {
    const quotes: SupplierQuoteResult[] = [
      { supplier: 'DigiKey', price: 0, inStock: true, isEstimate: false },
      { supplier: 'Mouser', price: 0, inStock: true, isEstimate: false },
    ];

    const result = selectBestQuote(quotes);
    expect(result.bestPrice).toBeNull();
    expect(result.bestSupplier).toBeNull();
  });

  it('returns null when all prices are null', () => {
    const quotes: SupplierQuoteResult[] = [
      { supplier: 'DigiKey', price: 0, inStock: true, isEstimate: false },
      { supplier: 'Mouser', price: 0, inStock: true, isEstimate: false },
    ];

    const result = selectBestQuote(quotes);
    expect(result.bestPrice).toBeNull();
    expect(result.bestSupplier).toBeNull();
  });

  it('returns null for empty array', () => {
    const result = selectBestQuote([]);
    expect(result.bestPrice).toBeNull();
    expect(result.bestSupplier).toBeNull();
  });

  it('handles a single valid quote', () => {
    const quotes: SupplierQuoteResult[] = [
      { supplier: 'DigiKey', price: 9.99, inStock: true, isEstimate: false },
    ];

    const result = selectBestQuote(quotes);
    expect(result.bestPrice).toBe(9.99);
    expect(result.bestSupplier).toBe('DigiKey');
  });
});
