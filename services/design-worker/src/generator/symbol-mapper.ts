import type { BomComponent } from './types';

export interface KiCadSymbolMapping {
  reference: string;
  library: string;
  symbol: string;
  footprint: string;
  fields: Record<string, string>;
}

type PartClassifier = {
  keywords: string[];
  defaultLibrary: string;
  defaultFootprint: string;
};

const PART_CLASSIFIERS: ReadonlyArray<PartClassifier> = [
  {
    keywords: ['cap', 'capacitor'],
    defaultLibrary: 'Device',
    defaultFootprint: 'Capacitor_SMD:C_0402_1005Metric',
  },
  {
    keywords: ['res', 'resistor'],
    defaultLibrary: 'Device',
    defaultFootprint: 'Resistor_SMD:R_0402_1005Metric',
  },
  {
    keywords: ['ind', 'inductor'],
    defaultLibrary: 'Device',
    defaultFootprint: 'Inductor_SMD:L_0402_1005Metric',
  },
  {
    keywords: ['led'],
    defaultLibrary: 'Device',
    defaultFootprint: 'LED_SMD:LED_0603_1608Metric',
  },
  {
    keywords: ['diode', 'zener', 'schottky', 'tvSs'],
    defaultLibrary: 'Device',
    defaultFootprint: 'Diode_SMD:D_0402_1005Metric',
  },
  {
    keywords: ['mosfet', 'fet', 'transistor', 'nmos', 'pmos'],
    defaultLibrary: 'Device',
    defaultFootprint: 'Package_TO_SOT_SMD:SOT-23',
  },
  {
    keywords: ['ic', 'regulator', 'ldo', 'buck', 'boost', 'converter'],
    defaultLibrary: 'Regulator_Linear',
    defaultFootprint: 'Package_SO:SOIC-8_3.9x4.9mm_P1.27mm',
  },
  {
    keywords: ['mcu', 'microcontroller', 'processor', 'stm32', 'esp32', 'nrf'],
    defaultLibrary: 'MCU_Module',
    defaultFootprint: 'Module:MCU_QFN-48',
  },
  {
    keywords: ['crystal', 'oscillator', 'osc'],
    defaultLibrary: 'Device',
    defaultFootprint: 'Crystal:Crystal_SMD_3225-4Pin_3.2x2.5mm',
  },
  {
    keywords: ['connector', 'usb', 'header', 'jack'],
    defaultLibrary: 'Connector',
    defaultFootprint: 'Connector_USB:USB_Micro-B_Molex-105017-0001',
  },
  {
    keywords: ['switch', 'button'],
    defaultLibrary: 'Switch',
    defaultFootprint: 'Button_Switch_SMD:SW_Push_1P1T_NO_6x6mm_H9.5mm',
  },
];

function classifyComponent(component: BomComponent): PartClassifier | undefined {
  const lowerSymbol = component.symbol.toLowerCase();
  const lowerValue = component.value.toLowerCase();
  const lowerMpn = component.mpn.toLowerCase();

  return PART_CLASSIFIERS.find((classifier) =>
    classifier.keywords.some(
      (kw) => lowerSymbol.includes(kw) || lowerValue.includes(kw) || lowerMpn.includes(kw),
    ),
  );
}

function resolveFootprint(component: BomComponent, classifier: PartClassifier | undefined): string {
  if (component.footprint && component.footprint.length > 0) {
    return component.footprint;
  }
  return classifier?.defaultFootprint ?? 'Device:None';
}

function resolveLibrary(component: BomComponent, classifier: PartClassifier | undefined): string {
  if (component.symbol.includes(':')) {
    return component.symbol.split(':')[0] ?? 'Device';
  }
  return classifier?.defaultLibrary ?? 'Device';
}

function resolveSymbolName(component: BomComponent): string {
  if (component.symbol.includes(':')) {
    const parts = component.symbol.split(':');
    return parts[1] ?? component.symbol;
  }
  return component.symbol;
}

export function mapBomToKiCad(bom: BomComponent[]): KiCadSymbolMapping[] {
  return bom.map((component) => {
    const classifier = classifyComponent(component);

    return {
      reference: component.reference,
      library: resolveLibrary(component, classifier),
      symbol: resolveSymbolName(component),
      footprint: resolveFootprint(component, classifier),
      fields: {
        Value: component.value,
        MPN: component.mpn,
        Manufacturer: component.manufacturer,
        Datasheet: '',
        Quantity: String(component.quantity),
      },
    };
  });
}
