type RiskLevel = 'low' | 'medium' | 'high';
type LifecycleStatus = 'active' | 'not-recommended' | 'obsolete' | 'unknown';
export type ProjectStatus =
  | 'draft'
  | 'intake'
  | 'specification'
  | 'architecture'
  | 'design'
  | 'validation'
  | 'quoting'
  | 'completed'
  | 'handed-off';

export interface BOMItem {
  id: string;
  ref: string;
  value: string;
  mpn: string;
  manufacturer: string;
  package: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lifecycle: LifecycleStatus;
  risk: RiskLevel;
  description: string;
  alternates?: BOMItem[];
}

export interface BOM {
  items: BOMItem[];
  totalCost: number;
  currency: string;
  lineCount: number;
  isEstimate: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export interface IntakeSession {
  messages: Message[];
  isReadyForSpecification: boolean;
  extractedRequirements: string[];
}

export interface QuoteBand {
  tier: 'low' | 'mid' | 'high';
  unitPrice: number;
  moq: number;
  nreCost: number;
  toolingCost: number;
  leadTimeWeeks: number;
  confidence: number;
}

export interface Quote {
  bands: QuoteBand[];
  assumptions: string[];
  includedScope: string[];
  excludedScope: string[];
  isEstimate: boolean;
  generatedAt: Date;
  validUntil: Date;
}

export interface DownloadFile {
  id: string;
  name: string;
  type: 'schematic-pdf' | 'schematic-svg' | 'gerbers' | 'pcb-3d' | 'bom-csv' | 'netlist' | 'bundle';
  sizeBytes: number;
  checksum: string;
  generatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  currentStep: number;
  totalSteps: number;
  createdAt: Date;
  updatedAt: Date;
  intake?: IntakeSession;
  bom?: BOM;
  quote?: Quote;
  downloads?: DownloadFile[];
}

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'ESP32 Sensor Hub',
    description:
      'Multi-sensor data acquisition board with WiFi/Bluetooth connectivity for industrial IoT applications.',
    status: 'quoting',
    currentStep: 9,
    totalSteps: 12,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    intake: {
      messages: [
        {
          id: 'msg-001',
          role: 'user',
          content:
            'I need a sensor hub board that can read temperature, humidity, pressure, and air quality. It should connect via WiFi and run on battery power.',
          timestamp: new Date('2024-01-15T10:00:00'),
        },
        {
          id: 'msg-002',
          role: 'assistant',
          content:
            'I understand you need a battery-powered IoT sensor hub. A few clarifications:\n\n1. What battery voltage/chemistry are you planning to use?\n2. What is your target battery life?\n3. Do you need any specific air quality sensors (CO2, VOCs, particulates)?\n4. What is your expected production volume?',
          timestamp: new Date('2024-01-15T10:05:00'),
        },
        {
          id: 'msg-003',
          role: 'user',
          content:
            '18650 Li-ion, 3 months minimum battery life, CO2 and VOCs, initial run of 500 units.',
          timestamp: new Date('2024-01-15T10:30:00'),
        },
        {
          id: 'msg-004',
          role: 'assistant',
          content:
            'Perfect. Based on your requirements, I recommend:\n\n- ESP32-S3 for low-power WiFi/BLE\n- SCD40 for CO2 sensing\n- SGP40 for VOC detection\n- BME280 for temperature/humidity/pressure\n- Power management IC for 18650 charging\n\nI have sufficient information to generate specifications. Shall I proceed?',
          timestamp: new Date('2024-01-15T10:35:00'),
        },
      ],
      isReadyForSpecification: true,
      extractedRequirements: [
        'ESP32-S3 wireless MCU',
        '18650 Li-ion battery powered',
        '3+ month battery life target',
        'SCD40 CO2 sensor',
        'SGP40 VOC sensor',
        'BME280 environmental sensor',
        '500 unit initial production',
      ],
    },
    bom: {
      items: [
        {
          id: 'bom-001',
          ref: 'U1',
          value: 'ESP32-S3-WROOM-1',
          mpn: 'ESP32-S3-WROOM-1-N8',
          manufacturer: 'Espressif',
          package: 'SMD-38',
          quantity: 1,
          unitPrice: 2.45,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: 'Wi-Fi + Bluetooth 5.0 MCU Module',
        },
        {
          id: 'bom-002',
          ref: 'U2',
          value: 'SCD40',
          mpn: 'SCD40-D-R2',
          manufacturer: 'Sensirion',
          package: 'LGA-10',
          quantity: 1,
          unitPrice: 15.2,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'medium',
          description: 'CO2 Sensor',
        },
        {
          id: 'bom-003',
          ref: 'U3',
          value: 'SGP40',
          mpn: 'SGP40-D-R4',
          manufacturer: 'Sensirion',
          package: 'DFN-6',
          quantity: 1,
          unitPrice: 3.8,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: 'VOC Sensor',
        },
        {
          id: 'bom-004',
          ref: 'U4',
          value: 'BME280',
          mpn: 'BME280',
          manufacturer: 'Bosch',
          package: 'LGA-8',
          quantity: 1,
          unitPrice: 2.15,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: 'Temp/Humidity/Pressure Sensor',
        },
        {
          id: 'bom-005',
          ref: 'U5',
          value: 'TP4056',
          mpn: 'TP4056',
          manufacturer: 'NanJing TopPower',
          package: 'SOP-8',
          quantity: 1,
          unitPrice: 0.35,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: 'Li-ion Battery Charger',
        },
        {
          id: 'bom-006',
          ref: 'Q1,Q2',
          value: 'SI2301CDS',
          mpn: 'SI2301CDS-T1-GE3',
          manufacturer: 'Vishay',
          package: 'SOT-23',
          quantity: 2,
          unitPrice: 0.12,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: 'P-Channel MOSFET',
        },
        {
          id: 'bom-007',
          ref: 'R1-R10',
          value: '10k',
          mpn: 'RC0603FR-0710KL',
          manufacturer: 'Yageo',
          package: '0603',
          quantity: 10,
          unitPrice: 0.01,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: '10k Resistor',
        },
        {
          id: 'bom-008',
          ref: 'C1-C8',
          value: '10uF',
          mpn: 'CL10A106KP8NNNC',
          manufacturer: 'Samsung',
          package: '0603',
          quantity: 8,
          unitPrice: 0.03,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: '10F Ceramic Capacitor',
        },
        {
          id: 'bom-009',
          ref: 'L1',
          value: '4.7uH',
          mpn: 'LQM18FN4R7M00D',
          manufacturer: 'Murata',
          package: '0603',
          quantity: 1,
          unitPrice: 0.18,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'medium',
          description: 'Power Inductor',
        },
        {
          id: 'bom-010',
          ref: 'D1',
          value: 'MBR120',
          mpn: 'MBR120VLSFT1G',
          manufacturer: 'onsemi',
          package: 'SOD-123',
          quantity: 1,
          unitPrice: 0.28,
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: 'Schottky Diode',
        },
      ],
      totalCost: 28.73,
      currency: 'USD',
      lineCount: 10,
      isEstimate: true,
    },
    quote: {
      bands: [
        {
          tier: 'low',
          unitPrice: 18.5,
          moq: 1000,
          nreCost: 2500,
          toolingCost: 800,
          leadTimeWeeks: 4,
          confidence: 0.75,
        },
        {
          tier: 'mid',
          unitPrice: 22.3,
          moq: 500,
          nreCost: 2500,
          toolingCost: 800,
          leadTimeWeeks: 4,
          confidence: 0.85,
        },
        {
          tier: 'high',
          unitPrice: 28.75,
          moq: 100,
          nreCost: 2500,
          toolingCost: 800,
          leadTimeWeeks: 6,
          confidence: 0.9,
        },
      ],
      assumptions: [
        '1.6mm FR-4 PCB, 4 layers',
        'ENIG surface finish',
        'Standard PCB tolerances',
        'All components sourced from authorized distributors',
        'Production in China (standard lead times)',
        'Functional test included',
      ],
      includedScope: [
        'PCB fabrication (4-layer)',
        'Component sourcing',
        'PCB assembly (SMT)',
        'Functional testing',
        'Packaging',
      ],
      excludedScope: [
        'Firmware development',
        'Custom test fixtures',
        'Certification (FCC, CE)',
        'Shipping and duties',
      ],
      isEstimate: true,
      generatedAt: new Date('2024-01-18'),
      validUntil: new Date('2024-02-18'),
    },
    downloads: [
      {
        id: 'dl-001',
        name: 'schematic.pdf',
        type: 'schematic-pdf',
        sizeBytes: 245760,
        checksum: 'a1b2c3d4e5f6',
        generatedAt: new Date('2024-01-18'),
      },
      {
        id: 'dl-002',
        name: 'schematic.svg',
        type: 'schematic-svg',
        sizeBytes: 51200,
        checksum: 'b2c3d4e5f6a1',
        generatedAt: new Date('2024-01-18'),
      },
      {
        id: 'dl-003',
        name: 'gerbers.zip',
        type: 'gerbers',
        sizeBytes: 1048576,
        checksum: 'c3d4e5f6a1b2',
        generatedAt: new Date('2024-01-18'),
      },
      {
        id: 'dl-004',
        name: 'pcb-3d.glb',
        type: 'pcb-3d',
        sizeBytes: 2097152,
        checksum: 'd4e5f6a1b2c3',
        generatedAt: new Date('2024-01-18'),
      },
      {
        id: 'dl-005',
        name: 'bom.csv',
        type: 'bom-csv',
        sizeBytes: 4096,
        checksum: 'e5f6a1b2c3d4',
        generatedAt: new Date('2024-01-18'),
      },
      {
        id: 'dl-006',
        name: 'netlist.net',
        type: 'netlist',
        sizeBytes: 8192,
        checksum: 'f6a1b2c3d4e5',
        generatedAt: new Date('2024-01-18'),
      },
      {
        id: 'dl-007',
        name: 'manufacturing-bundle.zip',
        type: 'bundle',
        sizeBytes: 5242880,
        checksum: 'a1b2c3d4e5f6',
        generatedAt: new Date('2024-01-18'),
      },
    ],
  },
  {
    id: 'proj-002',
    name: 'Motor Controller V2',
    description: 'BLDC motor controller for robotics applications with CAN bus interface.',
    status: 'design',
    currentStep: 6,
    totalSteps: 12,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-16'),
    intake: {
      messages: [
        {
          id: 'msg-101',
          role: 'user',
          content:
            'I need a BLDC motor controller for a robot arm. Max 48V, 20A continuous. Needs CAN bus for control.',
          timestamp: new Date('2024-01-10T14:00:00'),
        },
        {
          id: 'msg-102',
          role: 'assistant',
          content:
            'Understood. A few questions:\n\n1. What is the maximum motor power rating?\n2. Do you need position feedback (encoder/hall sensors)?\n3. Any specific microcontroller preference?\n4. Target production volume?',
          timestamp: new Date('2024-01-10T14:05:00'),
        },
      ],
      isReadyForSpecification: false,
      extractedRequirements: [
        '48V input voltage',
        '20A continuous current',
        'CAN bus interface',
        'BLDC motor control',
      ],
    },
  },
  {
    id: 'proj-003',
    name: 'USB-C Power Bank',
    description: 'High-capacity power bank with USB-C PD 100W output and wireless charging.',
    status: 'intake',
    currentStep: 2,
    totalSteps: 12,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'proj-004',
    name: 'LED Matrix Controller',
    description: '32x32 RGB LED matrix controller with WiFi and mobile app control.',
    status: 'completed',
    currentStep: 12,
    totalSteps: 12,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'proj-005',
    name: 'Precision ADC Module',
    description: '24-bit precision ADC with isolated inputs for industrial data acquisition.',
    status: 'draft',
    currentStep: 0,
    totalSteps: 12,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

export const mockBOM: BOM = mockProjects[0]?.bom ?? {
  items: [],
  totalCost: 0,
  currency: 'USD',
  lineCount: 0,
  isEstimate: true,
};

export interface QuoteBreakdownItem {
  label: string;
  value: number;
}

export interface SimpleQuote {
  id: string;
  projectId: string;
  low: number;
  mid: number;
  high: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: QuoteBreakdownItem[];
  assumptions: string[];
  generatedAt: Date;
  validUntil: Date;
}

export const mockQuote: SimpleQuote = {
  id: 'quote-001',
  projectId: 'proj-001',
  low: 1840,
  mid: 2300,
  high: 2875,
  confidence: 'medium',
  breakdown: [
    { label: 'Design Automation Fee', value: 500 },
    { label: 'Engineering Review', value: 300 },
    { label: 'PCB Fabrication', value: 450 },
    { label: 'Components', value: 680 },
    { label: 'Assembly', value: 220 },
    { label: 'QA & Handling', value: 150 },
  ],
  assumptions: [
    'Quote is for 100 units with standard 2-week lead time',
    'PCB specifications: 4-layer, 1.6mm, ENIG finish',
    'Component prices based on current market estimates',
    'Assembly includes AOI and basic functional test',
    'Does not include custom tooling or NRE charges',
    'Shipping and customs not included',
  ],
  generatedAt: new Date('2024-01-20T14:30:00Z'),
  validUntil: new Date('2024-02-20T14:30:00Z'),
};

export const mockDownloads: DownloadFile[] = mockProjects[0]?.downloads ?? [];

export const mockIntakeMessages: Message[] = mockProjects[0]?.intake?.messages ?? [];
