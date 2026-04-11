import type { ChunkRecord, ChunkMetadata } from '@raino/rag';

const PACKAGE_PATTERNS: Array<[RegExp, string]> = [
  [/LQFP\s*(\d+)/i, 'LQFP-$1'],
  [/QFP\s*(\d+)/i, 'QFP-$1'],
  [/BGA\s*(\d+)/i, 'BGA-$1'],
  [/QFN\s*(\d+)/i, 'QFN-$1'],
  [/DFN\s*(\d+)/i, 'DFN-$1'],
  [/SOT\s*(\d+)/i, 'SOT-$1'],
  [/SIP\s*(\d+)/i, 'SIP-$1'],
  [/DIP\s*(\d+)/i, 'DIP-$1'],
  [/TO-\d+/i, '$&'],
  [/TSSOP\s*(\d+)/i, 'TSSOP-$1'],
  [/SOIC\s*(\d+)/i, 'SOIC-$1'],
  [/MSOP\s*(\d+)/i, 'MSOP-$1'],
  [/WROOM/i, 'Module-WROOM'],
  [/WCSP/i, 'WCSP'],
];

const INTERFACE_PATTERNS: Array<[RegExp, string[]]> = [
  [/USB\b/i, ['USB']],
  [/UART\b/i, ['UART']],
  [/SPI\b/i, ['SPI']],
  [/\bI2C\b/i, ['I2C']],
  [/\bI2S\b/i, ['I2S']],
  [/CAN\s*bus/i, ['CAN']],
  [/ADC\b/i, ['ADC']],
  [/DAC\b/i, ['DAC']],
  [/PWM\b/i, ['PWM']],
  [/\bWiFi\b/i, ['WiFi']],
  [/\bBLE\b|bluetooth/i, ['BLE']],
  [/\bSDIO\b/i, ['SDIO']],
  [/\bEthernet\b/i, ['Ethernet']],
  [/JTAG\b/i, ['JTAG']],
  [/SWD\b/i, ['SWD']],
];

const VOLTAGE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(\d+\.?\d*)\s*V\s*(supply|voltage|VDD|VCC)/i, '$1V'],
  [/VDD\s*=\s*(\d+\.?\d*)\s*V/i, '$1V'],
  [/VCC\s*=\s*(\d+\.?\d*)\s*V/i, '$1V'],
  [/(\d+\.?\d*)\s*V\s*to\s*(\d+\.?\d*)\s*V/i, '$1V-$2V'],
  [/3\.3\s*V/i, '3.3V'],
  [/5\s*V/i, '5V'],
  [/1\.8\s*V/i, '1.8V'],
];

function inferPackage(content: string): string | undefined {
  for (const [pattern, pkg] of PACKAGE_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      return match.length > 1 ? match[0] : pkg;
    }
  }
  return undefined;
}

function inferInterfaces(content: string): string[] {
  const interfaces: string[] = [];
  for (const [pattern, ifaces] of INTERFACE_PATTERNS) {
    if (pattern.test(content)) {
      interfaces.push(...ifaces);
    }
  }
  return interfaces.length > 0 ? interfaces : undefined!;
}

function inferVoltageDomain(content: string): string | undefined {
  for (const [pattern, domain] of VOLTAGE_PATTERNS) {
    if (pattern.test(content)) {
      return domain;
    }
  }
  return undefined;
}

export function enrichMetadata(chunks: ChunkRecord[]): ChunkRecord[] {
  return chunks.map((chunk) => {
    const enriched: ChunkMetadata = { ...chunk.metadata };
    const content = chunk.content;

    if (!enriched.package) {
      const pkg = inferPackage(content);
      if (pkg) {
        enriched.package = pkg;
      }
    }

    if (!enriched.applicableInterfaces || enriched.applicableInterfaces.length === 0) {
      const ifaces = inferInterfaces(content);
      if (ifaces && ifaces.length > 0) {
        enriched.applicableInterfaces = ifaces;
      }
    }

    if (!enriched.voltageDomain) {
      const voltage = inferVoltageDomain(content);
      if (voltage) {
        enriched.voltageDomain = voltage;
      }
    }

    return {
      ...chunk,
      metadata: enriched,
    };
  });
}
