import type { SupplierAdapter, SearchOptions } from '../common/adapter';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types';

export interface MouserAdapter extends SupplierAdapter {
  getCartUrl(lineItems: Array<{ sku: string; quantity: number }>): string;
}

const FIXTURE_CATALOG: SupplierPartInfo[] = [
  {
    supplier: 'Mouser',
    supplierSku: '511-STM32F407VGT6',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    description: 'ARM Cortex-M4 MCU 168MHz 1MB Flash 100-LQFP',
    category: 'Microcontrollers',
    packageType: 'LQFP-100',
    lifecycle: 'active',
    stock: 9_870,
    stockUpdatedAt: Date.now(),
    unitPrice: 13.1,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 11.79 },
      { quantity: 100, price: 10.48 },
      { quantity: 500, price: 9.17 },
    ],
    datasheetUrl: 'https://www.st.com/resource/en/datasheet/stm32f407vg.pdf',
    leadTime: '10 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '356-ESP32-S3WROOM1',
    manufacturer: 'Espressif Systems',
    mpn: 'ESP32-S3-WROOM-1',
    description: 'WiFi + BLE MCU Module 240MHz 8MB Flash',
    category: 'Microcontrollers',
    packageType: 'Module',
    lifecycle: 'active',
    stock: 6_540,
    stockUpdatedAt: Date.now(),
    unitPrice: 5.1,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 4.85 },
      { quantity: 100, price: 4.2 },
      { quantity: 500, price: 3.65 },
    ],
    leadTime: '8 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '556-ATMEGA328PAU',
    manufacturer: 'Microchip Technology',
    mpn: 'ATmega328P-AU',
    description: 'AVR MCU 8-bit 20MHz 32KB Flash 32-TQFP',
    category: 'Microcontrollers',
    packageType: 'TQFP-32',
    lifecycle: 'active',
    stock: 28_900,
    stockUpdatedAt: Date.now(),
    unitPrice: 3.05,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 2.75 },
      { quantity: 100, price: 2.3 },
      { quantity: 1000, price: 1.85 },
    ],
    leadTime: '5 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '874-RP2040',
    manufacturer: 'Raspberry Pi',
    mpn: 'RP2040',
    description: 'Dual-core ARM Cortex-M0+ MCU 133MHz QFN-56',
    category: 'Microcontrollers',
    packageType: 'QFN-56',
    lifecycle: 'active',
    stock: 18_200,
    stockUpdatedAt: Date.now(),
    unitPrice: 1.2,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 1.0 },
      { quantity: 500, price: 0.85 },
    ],
    leadTime: '4 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '863-LM7805CT',
    manufacturer: 'ON Semiconductor',
    mpn: 'LM7805CT',
    description: 'Linear Voltage Regulator 5V 1A TO-220-3',
    category: 'Voltage Regulators - Linear',
    packageType: 'TO-220-3',
    lifecycle: 'active',
    stock: 48_300,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.67,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 0.58 },
      { quantity: 100, price: 0.47 },
      { quantity: 1000, price: 0.35 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '471-AMS1117-3.3',
    manufacturer: 'Advanced Monolithic Systems',
    mpn: 'AMS1117-3.3',
    description: 'Linear Voltage Regulator 3.3V 1A SOT-223',
    category: 'Voltage Regulators - Linear',
    packageType: 'SOT-223',
    lifecycle: 'active',
    stock: 35_600,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.38,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.3 },
      { quantity: 1000, price: 0.21 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '595-TPS63020',
    manufacturer: 'Texas Instruments',
    mpn: 'TPS63020',
    description: 'Buck-Boost Converter 2A Adjustable VQFN-8',
    category: 'Voltage Regulators - DC-DC',
    packageType: 'VQFN-8',
    lifecycle: 'active',
    stock: 5_200,
    stockUpdatedAt: Date.now(),
    unitPrice: 3.15,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 2.65 },
      { quantity: 500, price: 2.25 },
    ],
    leadTime: '8 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '640-USB4105',
    manufacturer: 'GCT',
    mpn: 'USB4105-GF-A',
    description: 'USB Type-C Connector 16-Pin Receptacle SMD',
    category: 'Connectors - USB',
    packageType: 'SMD',
    lifecycle: 'active',
    stock: 14_700,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.95,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.79 },
      { quantity: 500, price: 0.62 },
    ],
    leadTime: '4 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '649-10118194',
    manufacturer: 'Amphenol ICC (FCI)',
    mpn: '10118194-0001LF',
    description: 'USB Micro-B Connector Receptacle SMD Right-Angle',
    category: 'Connectors - USB',
    packageType: 'SMD',
    lifecycle: 'active',
    stock: 25_400,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.45,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.36 },
      { quantity: 1000, price: 0.29 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '771-PRTR5V0U2X',
    manufacturer: 'Nexperia',
    mpn: 'PRTR5V0U2X',
    description: 'ESD Protection Diode 5.5V SOT-143',
    category: 'Circuit Protection - ESD',
    packageType: 'SOT-143',
    lifecycle: 'active',
    stock: 27_800,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.3,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.24 },
      { quantity: 1000, price: 0.17 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '815-FA238V8MB3W',
    manufacturer: 'Seiko Epson',
    mpn: 'FA-238V 8.0000MB3-W',
    description: 'Crystal 8MHz 18pF SMD',
    category: 'Crystals and Oscillators',
    packageType: 'SMD-4',
    lifecycle: 'active',
    stock: 11_200,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.52,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.41 },
      { quantity: 1000, price: 0.31 },
    ],
    leadTime: '5 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '815-FA238V16MB3W',
    manufacturer: 'Seiko Epson',
    mpn: 'FA-238V 16.0000MB3-W',
    description: 'Crystal 16MHz 18pF SMD',
    category: 'Crystals and Oscillators',
    packageType: 'SMD-4',
    lifecycle: 'active',
    stock: 9_800,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.54,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.43 },
      { quantity: 1000, price: 0.32 },
    ],
    leadTime: '5 weeks',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '603-RC0402FR-0710KL',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-0710KL',
    description: 'Thick Film Resistor 10kOhm 1% 0402',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 980_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.0012,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0009 },
      { quantity: 1000, price: 0.0005 },
      { quantity: 10000, price: 0.0003 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '603-CC0402KRX7R9BB104',
    manufacturer: 'Yageo',
    mpn: 'CC0402KRX7R9BB104',
    description: 'Multilayer Ceramic Capacitor 0.1uF 10V X7R 0402',
    category: 'Capacitors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 2_100_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.0022,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0017 },
      { quantity: 1000, price: 0.0009 },
      { quantity: 10000, price: 0.0005 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '603-CC0402JRNPO9BN220',
    manufacturer: 'Yageo',
    mpn: 'CC0402JRNPO9BN220',
    description: 'Multilayer Ceramic Capacitor 22pF 50V C0G/NP0 0402',
    category: 'Capacitors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 1_600_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.0022,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0017 },
      { quantity: 1000, price: 0.0009 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '603-RC0402FR-071KL',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-071KL',
    description: 'Thick Film Resistor 1kOhm 1% 0402',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 1_300_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.0012,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0009 },
      { quantity: 1000, price: 0.0005 },
      { quantity: 10000, price: 0.0003 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '603-CC0805MKX5R8BB106',
    manufacturer: 'Yageo',
    mpn: 'CC0805MKX5R8BB106',
    description: 'Multilayer Ceramic Capacitor 10uF 25V X5R 0805',
    category: 'Capacitors',
    packageType: '0805',
    lifecycle: 'active',
    stock: 750_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.013,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.01 },
      { quantity: 1000, price: 0.006 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'Mouser',
    supplierSku: '603-RC0402FR-074K7L',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-074K7L',
    description: 'Thick Film Resistor 4.7kOhm 1% 0402',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 950_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.0012,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0009 },
      { quantity: 1000, price: 0.0005 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
];

function matchPart(part: SupplierPartInfo, query: string): boolean {
  const q = query.toLowerCase();
  return (
    part.mpn.toLowerCase().includes(q) ||
    part.manufacturer.toLowerCase().includes(q) ||
    part.description.toLowerCase().includes(q) ||
    part.category.toLowerCase().includes(q) ||
    part.supplierSku.toLowerCase().includes(q)
  );
}

function resolvePrice(part: SupplierPartInfo, qty: number): number {
  if (part.breakpoints && part.breakpoints.length > 0) {
    const sorted = [...part.breakpoints].sort((a, b) => b.quantity - a.quantity);
    for (const bp of sorted) {
      if (qty >= bp.quantity) return bp.price;
    }
  }
  return part.unitPrice ?? 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseLeadWeeks(leadTime: string): number {
  const match = leadTime.match(/(\d+)/);
  return match ? parseInt(match[1]!, 10) : 0;
}

export class MockMouserAdapter implements MouserAdapter {
  readonly name = 'Mouser';

  isEstimateOnly(): boolean {
    return true;
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async searchPart(query: string, options?: SearchOptions): Promise<SupplierSearchResult> {
    let results = FIXTURE_CATALOG.filter((p) => matchPart(p, query));

    if (options?.category) {
      const cat = options.category.toLowerCase();
      results = results.filter((p) => p.category.toLowerCase().includes(cat));
    }
    if (options?.manufacturer) {
      const mfr = options.manufacturer.toLowerCase();
      results = results.filter((p) => p.manufacturer.toLowerCase().includes(mfr));
    }
    if (options?.inStockOnly) {
      results = results.filter((p) => p.stock > 0);
    }
    if (options?.maxResults && options.maxResults > 0) {
      results = results.slice(0, options.maxResults);
    }

    return {
      supplier: this.name,
      query,
      results,
      totalResults: results.length,
      isEstimate: true,
    };
  }

  async getPartInfo(skuOrMpn: string): Promise<SupplierPartInfo | null> {
    const key = skuOrMpn.toLowerCase();
    return (
      FIXTURE_CATALOG.find(
        (p) => p.supplierSku.toLowerCase() === key || p.mpn.toLowerCase() === key,
      ) ?? null
    );
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
        isEstimate: true,
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
      isEstimate: true,
    };
  }

  getCartUrl(lineItems: Array<{ sku: string; quantity: number }>): string {
    if (lineItems.length === 0) return 'https://www.mouser.com/cart/';
    const params = lineItems.map((li) => `${encodeURIComponent(li.sku)}:${li.quantity}`).join('&');
    return `https://www.mouser.com/cart/?items=${params}`;
  }
}
