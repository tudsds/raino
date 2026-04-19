import type { SupplierAdapter, SearchOptions } from '../common/adapter';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types';

export interface DigiKeyAdapter extends SupplierAdapter {
  getCategories(): Promise<Array<{ id: string; name: string }>>;
}

const FIXTURE_CATALOG: SupplierPartInfo[] = [
  {
    supplier: 'DigiKey',
    supplierSku: '497-11531-ND',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    description: 'IC MCU 32BIT 1MB FLASH 100LQFP',
    category: 'Embedded - Microcontrollers',
    packageType: 'LQFP-100',
    lifecycle: 'active',
    stock: 12_480,
    stockUpdatedAt: Date.now(),
    unitPrice: 12.34,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 11.12 },
      { quantity: 100, price: 9.87 },
      { quantity: 1000, price: 8.45 },
    ],
    datasheetUrl: 'https://www.st.com/resource/en/datasheet/stm32f407vg.pdf',
    leadTime: '8 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '1904-ESP32-S3WROOM-1CT',
    manufacturer: 'Espressif Systems',
    mpn: 'ESP32-S3-WROOM-1',
    description: 'IC MCU WiFi+BT 8MB FLASH MODULE',
    category: 'Embedded - Microcontrollers',
    packageType: 'Module',
    lifecycle: 'active',
    stock: 8_320,
    stockUpdatedAt: Date.now(),
    unitPrice: 4.8,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 4.56 },
      { quantity: 100, price: 3.92 },
      { quantity: 1000, price: 3.4 },
    ],
    datasheetUrl:
      'https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf',
    leadTime: '6 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'ATMEGA328P-AU-ND',
    manufacturer: 'Microchip Technology',
    mpn: 'ATmega328P-AU',
    description: 'IC MCU 8BIT 32KB FLASH 32TQFP',
    category: 'Embedded - Microcontrollers',
    packageType: 'TQFP-32',
    lifecycle: 'active',
    stock: 34_500,
    stockUpdatedAt: Date.now(),
    unitPrice: 2.88,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 2.59 },
      { quantity: 100, price: 2.18 },
      { quantity: 1000, price: 1.74 },
    ],
    leadTime: '4 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'RP2040-ND',
    manufacturer: 'Raspberry Pi',
    mpn: 'RP2040',
    description: 'IC MCU 32BIT DUAL CORE 16MB EXT QFN-56',
    category: 'Embedded - Microcontrollers',
    packageType: 'QFN-56',
    lifecycle: 'active',
    stock: 22_100,
    stockUpdatedAt: Date.now(),
    unitPrice: 1.1,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.95 },
      { quantity: 1000, price: 0.8 },
    ],
    leadTime: '4 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'LM7805CT-ND',
    manufacturer: 'ON Semiconductor',
    mpn: 'LM7805CT',
    description: 'IC REG LINEAR 5V 1A TO-220-3',
    category: 'Power - Regulators - Linear',
    packageType: 'TO-220-3',
    lifecycle: 'active',
    stock: 56_200,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.62,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 0.55 },
      { quantity: 100, price: 0.44 },
      { quantity: 1000, price: 0.33 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'AMS1117-3.3CT-ND',
    manufacturer: 'Advanced Monolithic Systems',
    mpn: 'AMS1117-3.3',
    description: 'IC REG LINEAR 3.3V 1A SOT-223',
    category: 'Power - Regulators - Linear',
    packageType: 'SOT-223',
    lifecycle: 'active',
    stock: 41_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.35,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.28 },
      { quantity: 1000, price: 0.19 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '296-TPS63020DCPRCT-ND',
    manufacturer: 'Texas Instruments',
    mpn: 'TPS63020',
    description: 'IC REG BUCK-BOOST 2A ADJ 8VQFN',
    category: 'Power - Regulators - DC-DC Switching',
    packageType: 'VQFN-8',
    lifecycle: 'active',
    stock: 6_890,
    stockUpdatedAt: Date.now(),
    unitPrice: 2.95,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 2.48 },
      { quantity: 1000, price: 2.1 },
    ],
    leadTime: '6 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '124-USB4105-GF-ND',
    manufacturer: 'GCT',
    mpn: 'USB4105-GF-A',
    description: 'CONN USB TYPE C 16PIN RCPT SMD',
    category: 'Connectors - USB',
    packageType: 'SMD',
    lifecycle: 'active',
    stock: 18_340,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.89,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.74 },
      { quantity: 1000, price: 0.58 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '609-4613-1-ND',
    manufacturer: 'Amphenol ICC (FCI)',
    mpn: '10118194-0001LF',
    description: 'CONN USB MICRO B RCPT SMD R/A',
    category: 'Connectors - USB',
    packageType: 'SMD',
    lifecycle: 'active',
    stock: 28_960,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.42,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.34 },
      { quantity: 1000, price: 0.27 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'PRTR5V0U2XCT-ND',
    manufacturer: 'Nexperia',
    mpn: 'PRTR5V0U2X',
    description: 'TVS DIODE 5.5V SOT-143',
    category: 'Circuit Protection - TVS Diodes',
    packageType: 'SOT-143',
    lifecycle: 'active',
    stock: 31_200,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.28,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.22 },
      { quantity: 1000, price: 0.16 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'SE3475CT-ND',
    manufacturer: 'Seiko Epson',
    mpn: 'FA-238V 8.0000MB3-W',
    description: 'XTAL 8.0000MHZ 18PF SMD',
    category: 'Crystals and Oscillators',
    packageType: 'SMD-4',
    lifecycle: 'active',
    stock: 15_600,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.48,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.38 },
      { quantity: 1000, price: 0.28 },
    ],
    leadTime: '4 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: 'SE3476CT-ND',
    manufacturer: 'Seiko Epson',
    mpn: 'FA-238V 16.0000MB3-W',
    description: 'XTAL 16.0000MHZ 18PF SMD',
    category: 'Crystals and Oscillators',
    packageType: 'SMD-4',
    lifecycle: 'active',
    stock: 12_300,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.5,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.4 },
      { quantity: 1000, price: 0.3 },
    ],
    leadTime: '4 weeks',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '311-10.0KFRCT-ND',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-0710KL',
    description: 'RES 10K OHM 1% 1/16W 0402',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 1_200_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.001,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0008 },
      { quantity: 1000, price: 0.0004 },
      { quantity: 10000, price: 0.0002 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '311-100NFCT-ND',
    manufacturer: 'Yageo',
    mpn: 'CC0402KRX7R9BB104',
    description: 'CAP 0.1UF 10V X7R 0402',
    category: 'Capacitors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 2_500_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.002,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0015 },
      { quantity: 1000, price: 0.0008 },
      { quantity: 10000, price: 0.0004 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '311-22PFCT-ND',
    manufacturer: 'Yageo',
    mpn: 'CC0402JRNPO9BN220',
    description: 'CAP 22PF 50V C0G/NP0 0402',
    category: 'Capacitors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 1_800_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.002,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0015 },
      { quantity: 1000, price: 0.0008 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '311-1.0KFRCT-ND',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-071KL',
    description: 'RES 1K OHM 1% 1/16W 0402',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 1_500_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.001,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0008 },
      { quantity: 1000, price: 0.0004 },
      { quantity: 10000, price: 0.0002 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '311-10UFCT-ND',
    manufacturer: 'Yageo',
    mpn: 'CC0805MKX5R8BB106',
    description: 'CAP 10UF 25V X5R 0805',
    category: 'Capacitors',
    packageType: '0805',
    lifecycle: 'active',
    stock: 890_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.012,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.009 },
      { quantity: 1000, price: 0.005 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    supplier: 'DigiKey',
    supplierSku: '311-4.7KFCT-ND',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-074K7L',
    description: 'RES 4.7K OHM 1% 1/16W 0402',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 1_100_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.001,
    currency: 'USD',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.0008 },
      { quantity: 1000, price: 0.0004 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
];

const FIXTURE_CATEGORIES: Array<{ id: string; name: string }> = [
  { id: 'cat-mcus', name: 'Embedded - Microcontrollers' },
  { id: 'cat-reg-linear', name: 'Power - Regulators - Linear' },
  { id: 'cat-reg-dc-dc', name: 'Power - Regulators - DC-DC Switching' },
  { id: 'cat-usb', name: 'Connectors - USB' },
  { id: 'cat-tvs', name: 'Circuit Protection - TVS Diodes' },
  { id: 'cat-crystal', name: 'Crystals and Oscillators' },
  { id: 'cat-resistors', name: 'Resistors' },
  { id: 'cat-capacitors', name: 'Capacitors' },
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

export class MockDigiKeyAdapter implements DigiKeyAdapter {
  readonly name = 'DigiKey';

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

  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    return FIXTURE_CATEGORIES;
  }
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
