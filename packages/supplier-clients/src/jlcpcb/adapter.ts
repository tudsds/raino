import type { SupplierAdapter, SearchOptions } from '../common/adapter';
import type {
  SupplierPartInfo,
  SupplierQuote,
  SupplierQuoteLineItem,
  SupplierSearchResult,
} from '../common/types';

export interface JLCPCBAdapter extends SupplierAdapter {
  getComponentSpecs(jlcpcbPartId: string): Promise<{
    partId: string;
    mpn: string;
    package: string;
    specs: Record<string, string>;
  } | null>;

  isInBasicLibrary(mpn: string): Promise<boolean>;
  isInExtendedLibrary(mpn: string): Promise<boolean>;
}

interface JLCPCBFixturePart extends SupplierPartInfo {
  jlcpcbPartId: string;
  basicLibrary: boolean;
  extendedLibrary: boolean;
  specs: Record<string, string>;
}

const FIXTURE_CATALOG: JLCPCBFixturePart[] = [
  {
    jlcpcbPartId: 'C43058',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Core: 'ARM Cortex-M4', Flash: '1MB', RAM: '192KB', Frequency: '168MHz', 'I/O': '82' },
    supplier: 'JLCPCB',
    supplierSku: 'C43058',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    description: 'STM32F407VGT6 ARM Cortex-M4 MCU 168MHz 1MB LQFP-100',
    category: 'MCU',
    packageType: 'LQFP-100',
    lifecycle: 'active',
    stock: 45_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 10.42,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 9.38 },
      { quantity: 100, price: 8.34 },
      { quantity: 500, price: 7.3 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C2913998',
    basicLibrary: false,
    extendedLibrary: true,
    specs: {
      Core: 'Xtensa 32-bit LX7',
      Flash: '8MB (external)',
      Frequency: '240MHz',
      WiFi: '802.11 b/g/n',
      BLE: '5.0',
    },
    supplier: 'JLCPCB',
    supplierSku: 'C2913998',
    manufacturer: 'Espressif Systems',
    mpn: 'ESP32-S3-WROOM-1',
    description: 'ESP32-S3-WROOM-1 WiFi+BLE MCU Module 240MHz',
    category: 'MCU',
    packageType: 'Module',
    lifecycle: 'active',
    stock: 18_500,
    stockUpdatedAt: Date.now(),
    unitPrice: 22.8,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 21.66 },
      { quantity: 100, price: 19.38 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C14877',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Core: 'AVR', Flash: '32KB', RAM: '2KB', Frequency: '20MHz', 'I/O': '23' },
    supplier: 'JLCPCB',
    supplierSku: 'C14877',
    manufacturer: 'Microchip Technology',
    mpn: 'ATmega328P-AU',
    description: 'ATmega328P-AU AVR MCU 20MHz 32KB TQFP-32',
    category: 'MCU',
    packageType: 'TQFP-32',
    lifecycle: 'active',
    stock: 68_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 7.5,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 10, price: 6.75 },
      { quantity: 100, price: 5.63 },
      { quantity: 500, price: 4.5 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C2040',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Core: 'ARM Cortex-M0+ (dual)', SRAM: '264KB', Frequency: '133MHz', 'I/O': '30' },
    supplier: 'JLCPCB',
    supplierSku: 'C2040',
    manufacturer: 'Raspberry Pi',
    mpn: 'RP2040',
    description: 'RP2040 Dual-core ARM Cortex-M0+ QFN-56',
    category: 'MCU',
    packageType: 'QFN-56',
    lifecycle: 'active',
    stock: 55_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 5.8,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 4.93 },
      { quantity: 500, price: 4.06 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C6186',
    basicLibrary: true,
    extendedLibrary: true,
    specs: {
      'Output Voltage': '5V',
      'Max Current': '1A',
      'Dropout Voltage': '2V',
      Polarity: 'Positive',
    },
    supplier: 'JLCPCB',
    supplierSku: 'C6186',
    manufacturer: 'ON Semiconductor',
    mpn: 'LM7805CT',
    description: 'LM7805CT Linear Regulator 5V 1A TO-220-3',
    category: 'Voltage Regulators',
    packageType: 'TO-220-3',
    lifecycle: 'active',
    stock: 120_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 1.2,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.96 },
      { quantity: 1000, price: 0.72 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C6187',
    basicLibrary: true,
    extendedLibrary: true,
    specs: {
      'Output Voltage': '3.3V',
      'Max Current': '1A',
      'Dropout Voltage': '1.1V',
      Polarity: 'Positive',
    },
    supplier: 'JLCPCB',
    supplierSku: 'C6187',
    manufacturer: 'Advanced Monolithic Systems',
    mpn: 'AMS1117-3.3',
    description: 'AMS1117-3.3 Linear Regulator 3.3V 1A SOT-223',
    category: 'Voltage Regulators',
    packageType: 'SOT-223',
    lifecycle: 'active',
    stock: 200_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.6,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.45 },
      { quantity: 1000, price: 0.3 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C468031',
    basicLibrary: false,
    extendedLibrary: true,
    specs: {
      'Input Voltage': '1.8-5.5V',
      'Output Voltage': 'Adjustable',
      'Max Current': '2A',
      Topology: 'Buck-Boost',
    },
    supplier: 'JLCPCB',
    supplierSku: 'C468031',
    manufacturer: 'Texas Instruments',
    mpn: 'TPS63020',
    description: 'TPS63020 Buck-Boost Converter 2A VQFN-8',
    category: 'Voltage Regulators',
    packageType: 'VQFN-8',
    lifecycle: 'active',
    stock: 8_500,
    stockUpdatedAt: Date.now(),
    unitPrice: 15.8,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 13.43 },
      { quantity: 500, price: 11.06 },
    ],
    leadTime: '3 weeks',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C165948',
    basicLibrary: false,
    extendedLibrary: true,
    specs: { Type: 'USB Type-C', Pins: '16', 'Current Rating': '5A', Orientation: 'Vertical' },
    supplier: 'JLCPCB',
    supplierSku: 'C165948',
    manufacturer: 'GCT',
    mpn: 'USB4105-GF-A',
    description: 'USB4105-GF-A USB Type-C 16-Pin SMD Receptacle',
    category: 'Connectors',
    packageType: 'SMD',
    lifecycle: 'active',
    stock: 32_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 2.9,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 2.47 },
      { quantity: 500, price: 1.9 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C136917',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Type: 'USB Micro-B', Pins: '5', 'Current Rating': '1.8A', Orientation: 'Right-Angle' },
    supplier: 'JLCPCB',
    supplierSku: 'C136917',
    manufacturer: 'Amphenol ICC (FCI)',
    mpn: '10118194-0001LF',
    description: '10118194-0001LF USB Micro-B SMD Right-Angle',
    category: 'Connectors',
    packageType: 'SMD',
    lifecycle: 'active',
    stock: 58_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 1.0,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.8 },
      { quantity: 1000, price: 0.6 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C15809',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Type: 'TVS', Voltage: '5.5V', Channels: '2', Capacitance: '1pF' },
    supplier: 'JLCPCB',
    supplierSku: 'C15809',
    manufacturer: 'Nexperia',
    mpn: 'PRTR5V0U2X',
    description: 'PRTR5V0U2X ESD Protection Diode SOT-143',
    category: 'Circuit Protection',
    packageType: 'SOT-143',
    lifecycle: 'active',
    stock: 75_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.65,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.52 },
      { quantity: 1000, price: 0.39 },
    ],
    leadTime: '1 week',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C115939',
    basicLibrary: false,
    extendedLibrary: true,
    specs: {
      Frequency: '8MHz',
      'Load Capacitance': '18pF',
      Tolerance: '±30ppm',
      Package: 'SMD-3225',
    },
    supplier: 'JLCPCB',
    supplierSku: 'C115939',
    manufacturer: 'Seiko Epson',
    mpn: 'FA-238V 8.0000MB3-W',
    description: 'FA-238V 8MHz 18pF SMD Crystal',
    category: 'Crystals and Oscillators',
    packageType: 'SMD-3225',
    lifecycle: 'active',
    stock: 22_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 1.5,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 1.2 },
      { quantity: 500, price: 0.9 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C13739',
    basicLibrary: true,
    extendedLibrary: true,
    specs: {
      Frequency: '16MHz',
      'Load Capacitance': '18pF',
      Tolerance: '±30ppm',
      Package: 'SMD-3225',
    },
    supplier: 'JLCPCB',
    supplierSku: 'C13739',
    manufacturer: 'Seiko Epson',
    mpn: 'FA-238V 16.0000MB3-W',
    description: 'FA-238V 16MHz 18pF SMD Crystal',
    category: 'Crystals and Oscillators',
    packageType: 'SMD-3225',
    lifecycle: 'active',
    stock: 28_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 1.5,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 1.2 },
      { quantity: 500, price: 0.9 },
    ],
    leadTime: '2 weeks',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C25744',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Resistance: '10kOhm', Tolerance: '1%', Power: '1/16W', Package: '0402' },
    supplier: 'JLCPCB',
    supplierSku: 'C25744',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-0710KL',
    description: '0402 10kOhm 1% Thick Film Resistor',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 500_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.01,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.008 },
      { quantity: 1000, price: 0.004 },
    ],
    leadTime: '3 days',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C1525',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Capacitance: '0.1uF', Voltage: '10V', Dielectric: 'X7R', Package: '0402' },
    supplier: 'JLCPCB',
    supplierSku: 'C1525',
    manufacturer: 'Yageo',
    mpn: 'CC0402KRX7R9BB104',
    description: '0402 0.1uF 10V X7R MLCC',
    category: 'Capacitors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 800_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.01,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.008 },
      { quantity: 1000, price: 0.004 },
    ],
    leadTime: '3 days',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C1545',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Capacitance: '22pF', Voltage: '50V', Dielectric: 'C0G/NP0', Package: '0402' },
    supplier: 'JLCPCB',
    supplierSku: 'C1545',
    manufacturer: 'Yageo',
    mpn: 'CC0402JRNPO9BN220',
    description: '0402 22pF 50V C0G/NP0 MLCC',
    category: 'Capacitors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 600_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.01,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.008 },
      { quantity: 1000, price: 0.004 },
    ],
    leadTime: '3 days',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C11702',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Resistance: '1kOhm', Tolerance: '1%', Power: '1/16W', Package: '0402' },
    supplier: 'JLCPCB',
    supplierSku: 'C11702',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-071KL',
    description: '0402 1kOhm 1% Thick Film Resistor',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 450_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.01,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.008 },
      { quantity: 1000, price: 0.004 },
    ],
    leadTime: '3 days',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C45783',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Capacitance: '10uF', Voltage: '25V', Dielectric: 'X5R', Package: '0805' },
    supplier: 'JLCPCB',
    supplierSku: 'C45783',
    manufacturer: 'Yageo',
    mpn: 'CC0805MKX5R8BB106',
    description: '0805 10uF 25V X5R MLCC',
    category: 'Capacitors',
    packageType: '0805',
    lifecycle: 'active',
    stock: 350_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.05,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.04 },
      { quantity: 1000, price: 0.025 },
    ],
    leadTime: '3 days',
    isEstimate: true,
  },
  {
    jlcpcbPartId: 'C25866',
    basicLibrary: true,
    extendedLibrary: true,
    specs: { Resistance: '4.7kOhm', Tolerance: '1%', Power: '1/16W', Package: '0402' },
    supplier: 'JLCPCB',
    supplierSku: 'C25866',
    manufacturer: 'Yageo',
    mpn: 'RC0402FR-074K7L',
    description: '0402 4.7kOhm 1% Thick Film Resistor',
    category: 'Resistors',
    packageType: '0402',
    lifecycle: 'active',
    stock: 400_000,
    stockUpdatedAt: Date.now(),
    unitPrice: 0.01,
    currency: 'CNY',
    moq: 1,
    breakpoints: [
      { quantity: 100, price: 0.008 },
      { quantity: 1000, price: 0.004 },
    ],
    leadTime: '3 days',
    isEstimate: true,
  },
];

function matchPart(part: JLCPCBFixturePart, query: string): boolean {
  const q = query.toLowerCase();
  return (
    part.mpn.toLowerCase().includes(q) ||
    part.manufacturer.toLowerCase().includes(q) ||
    part.description.toLowerCase().includes(q) ||
    part.category.toLowerCase().includes(q) ||
    part.supplierSku.toLowerCase().includes(q) ||
    part.jlcpcbPartId.toLowerCase().includes(q)
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

export class MockJLCPCBAdapter implements JLCPCBAdapter {
  readonly name = 'JLCPCB';

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
    const part = FIXTURE_CATALOG.find(
      (p) =>
        p.supplierSku.toLowerCase() === key ||
        p.mpn.toLowerCase() === key ||
        p.jlcpcbPartId.toLowerCase() === key,
    );
    return part ?? null;
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
      currency: items[0]?.currency ?? 'CNY',
      estimatedLeadTime: `${maxLeadWeeks} weeks`,
      validUntil: Date.now() + 24 * 60 * 60 * 1000,
      isEstimate: true,
    };
  }

  async getComponentSpecs(jlcpcbPartId: string): Promise<{
    partId: string;
    mpn: string;
    package: string;
    specs: Record<string, string>;
  } | null> {
    const key = jlcpcbPartId.toLowerCase();
    const part = FIXTURE_CATALOG.find((p) => p.jlcpcbPartId.toLowerCase() === key);
    if (!part) return null;
    return {
      partId: part.jlcpcbPartId,
      mpn: part.mpn,
      package: part.packageType ?? 'Unknown',
      specs: part.specs,
    };
  }

  async isInBasicLibrary(mpn: string): Promise<boolean> {
    const key = mpn.toLowerCase();
    const part = FIXTURE_CATALOG.find((p) => p.mpn.toLowerCase() === key);
    return part?.basicLibrary ?? false;
  }

  async isInExtendedLibrary(mpn: string): Promise<boolean> {
    const key = mpn.toLowerCase();
    const part = FIXTURE_CATALOG.find((p) => p.mpn.toLowerCase() === key);
    return part?.extendedLibrary ?? false;
  }
}
