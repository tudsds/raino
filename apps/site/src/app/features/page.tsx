import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { LiquidGlassCard } from '@raino/ui';

export const metadata: Metadata = {
  title: 'Raino — Features',
  description:
    "Explore Raino's production hardware workflow capabilities: natural language intake, structured specs, approved architectures, intelligent BOM, KiCad generation, and manufacturing handoff.",
  openGraph: {
    title: 'Raino — Features',
    description:
      'Every capability in Raino is designed for production hardware workflows. No gimmicks. No autopilot. Just structured engineering.',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/features',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — Features',
    description:
      'Every capability in Raino is designed for production hardware workflows. No gimmicks. No autopilot. Just structured engineering.',
  },
};

const detailedFeatures = [
  {
    title: 'Natural Language Intake',
    subtitle: 'Describe hardware in plain language',
    description:
      'Start with a simple description of what you want to build. Raino parses natural language input to extract hardware requirements, pin constraints, power budgets, and connectivity needs.',
    capabilities: [
      'Multi-turn clarifying question loop',
      'Constraint extraction from descriptions',
      'Ambiguity detection and resolution',
      'Requirement validation and scoring',
    ],
    useCase:
      'A hardware engineer describes a sensor board with 5V input, I2C interface, and specific dimensions. Raino asks clarifying questions about sensor type, sampling rate, and environmental constraints.',
    visual: 'chat' as const,
  },
  {
    title: 'Structured Specifications',
    subtitle: 'Fuzzy intent becomes precise specs',
    description:
      'Every requirement is captured in a structured format with validation rules. Specifications are versioned, traceable, and linked to their source rationale.',
    capabilities: [
      'Formal requirement schemas',
      'Validation against architecture constraints',
      'Version control and diff tracking',
      'Traceability to source rationale',
    ],
    useCase:
      'The engineer reviews the structured specification generated from their description. Each requirement shows its source (which part of the original description) and confidence score.',
    visual: 'schema' as const,
  },
  {
    title: 'Approved Architectures',
    subtitle: 'Constrained architecture selection',
    description:
      'Raino does not generate unconstrained designs. Instead, it matches your requirements against a library of pre-validated architecture templates.',
    capabilities: [
      'Template library with validation rules',
      'Requirement-to-template matching',
      'Architecture constraint enforcement',
      'Traceability to source requirements',
    ],
    useCase:
      'Based on the sensor board requirements, Raino recommends the "Low-Power Sensor Node" template, which includes validated power management and communication subcircuits.',
    visual: 'template' as const,
  },
  {
    title: 'Intelligent BOM',
    subtitle: 'Full bill of materials with sourcing',
    description:
      'The BOM includes every component with procurement data from real suppliers, alternates for each line item, and risk indicators for availability and lifecycle.',
    capabilities: [
      'Real supplier price queries (DigiKey, Mouser, JLCPCB)',
      'Alternate part suggestions with compatibility checks',
      'Lifecycle and availability risk scoring',
      'Footprint mapping and validation',
    ],
    useCase:
      'The BOM shows the recommended accelerometer with prices from three suppliers, two alternates with trade-off analysis, and a warning that one alternate is not recommended for new designs.',
    visual: 'bom' as const,
  },
  {
    title: 'KiCad Generation',
    subtitle: 'Automated schematic and PCB generation',
    description:
      'Raino generates production-ready KiCad projects including schematic sheets, PCB layout, design rules, and manufacturing outputs.',
    capabilities: [
      'Schematic generation from architecture templates',
      'PCB layout with design rule checking',
      'ERC/DRC validation and error reporting',
      'Gerber, drill, and pick-and-place exports',
    ],
    useCase:
      'After reviewing the BOM, Raino generates the KiCad project. The schematic shows the sensor interface circuit, power regulation, and microcontroller connections. The PCB layout respects the dimensional constraints.',
    visual: 'kicad' as const,
  },
  {
    title: 'Manufacturing Handoff',
    subtitle: 'From design to production',
    description:
      'Generate manufacturing bundles with previews, rough quotes, and optional handoff to PCBA services.',
    capabilities: [
      'Interactive 2D and 3D previews',
      'Manufacturing bundle generation (ZIP)',
      'Rough quote with confidence bands',
      'Optional PCBA quote request',
    ],
    useCase:
      'The engineer reviews the 3D preview of the assembled board, downloads the manufacturing bundle, and gets a rough quote of $45-65 per unit at 100 quantity with medium confidence.',
    visual: 'preview' as const,
  },
];

const cardConfigs = [
  { span: 'lg:col-span-2 lg:row-span-2', intensity: 'maximum' as const, tint: 'blue' as const, spring: 'smooth' as const, noise: true },
  { span: 'lg:row-span-2', intensity: 'medium' as const, tint: 'default' as const, spring: 'gentle' as const, noise: false },
  { span: '', intensity: 'light' as const, tint: 'default' as const, spring: 'snappy' as const, noise: true },
  { span: 'lg:col-span-2', intensity: 'maximum' as const, tint: 'default' as const, spring: 'smooth' as const, noise: false },
  { span: '', intensity: 'medium' as const, tint: 'default' as const, spring: 'gentle' as const, noise: true },
  { span: 'lg:col-span-2', intensity: 'maximum' as const, tint: 'blue' as const, spring: 'smooth' as const, noise: false },
];

function FeatureNumberBadge({ index }: { index: number }) {
  const t = useTranslations('features');

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1565C0]/10 border border-[#1565C0]/30 text-sm text-[#1565C0] font-mono mb-4 rounded-lg">
      {t('featureNumber', { number: String(index + 1).padStart(2, '0') })}
    </div>
  );
}

function CapabilityList({ capabilities }: { capabilities: string[] }) {
  return (
    <ul className="space-y-2">
      {capabilities.map((cap, idx) => (
        <li key={idx} className="flex items-start gap-3 text-[#94A3B8]">
          <span className="text-[#1565C0] mt-1 shrink-0">›</span>
          <span>{cap}</span>
        </li>
      ))}
    </ul>
  );
}

function UseCaseBox({ useCase }: { useCase: string }) {
  const t = useTranslations('features');

  return (
    <div className="p-4 glass-surface rounded-xl">
      <h4 className="text-sm font-semibold text-[#64748B] mb-2 font-serif">{t('useCaseExample')}</h4>
      <p className="text-sm text-[#94A3B8] font-serif">{useCase}</p>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="w-full max-w-sm space-y-3 mx-auto">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-[#6191D3] rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0">
          U
        </div>
        <div className="flex-1 p-3 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm text-[#94A3B8]">
          I need a sensor board with 5V input, I2C interface, and 40x30mm dimensions
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-[#1565C0] rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0">
          R
        </div>
        <div className="flex-1 p-3 bg-white/[0.06] border border-[#1565C0]/30 rounded-lg text-sm text-[#94A3B8]">
          What type of sensor? Temperature, accelerometer, or something else?
        </div>
      </div>
    </div>
  );
}

function SchemaVisual() {
  return (
    <div className="w-full max-w-sm space-y-2 font-mono text-xs mx-auto">
      <div className="p-3 bg-white/[0.06] border-l-2 border-[#1565C0] rounded-r-lg">
        <span className="text-[#1565C0]">power_input:</span>
        <span className="text-[#94A3B8]"> 5V ±5%</span>
      </div>
      <div className="p-3 bg-white/[0.06] border-l-2 border-[#6191D3] rounded-r-lg">
        <span className="text-[#6191D3]">interface:</span>
        <span className="text-[#94A3B8]"> I2C @ 400kHz</span>
      </div>
      <div className="p-3 bg-white/[0.06] border-l-2 border-[#1565C0] rounded-r-lg">
        <span className="text-[#1565C0]">dimensions:</span>
        <span className="text-[#94A3B8]"> 40mm × 30mm</span>
      </div>
    </div>
  );
}

function TemplateVisual() {
  return (
    <div className="w-full max-w-sm p-4 bg-white/[0.06] border border-white/[0.12] rounded-xl mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[#1565C0]/10 border border-[#1565C0]/30 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-[#1565C0] text-lg">◎</span>
        </div>
        <div>
          <div className="font-semibold text-[#E2E8F0] font-serif">Low-Power Sensor Node</div>
          <div className="text-xs text-[#64748B] font-serif">Template #247</div>
        </div>
      </div>
      <div className="text-xs text-[#64748B] space-y-1 font-serif">
        <div className="flex justify-between">
          <span>Power:</span> <span className="text-[#94A3B8]">3.3V / 5V</span>
        </div>
        <div className="flex justify-between">
          <span>Interfaces:</span>{' '}
          <span className="text-[#94A3B8]">I2C, SPI, UART</span>
        </div>
        <div className="flex justify-between">
          <span>Validation:</span> <span className="text-[#4CAF50]">✓ Production</span>
        </div>
      </div>
    </div>
  );
}

function BOMVisual() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-xs font-mono text-[#64748B] mb-2">Bill of Materials (3 items)</div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm">
          <span className="text-[#94A3B8] font-serif">MCP9808T-E/MS</span>
          <span className="text-[#4CAF50] text-xs font-mono">$2.45</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm">
          <span className="text-[#94A3B8] font-serif">TPS563201DDCR</span>
          <span className="text-[#4CAF50] text-xs font-mono">$0.89</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white/[0.06] border border-white/[0.12] rounded-lg text-sm">
          <span className="text-[#94A3B8] font-serif">STM32L072KZ</span>
          <span className="text-[#FF9800] text-xs font-mono">$4.20 ⚠</span>
        </div>
      </div>
    </div>
  );
}

function KiCadVisual() {
  return (
    <div className="w-full max-w-sm aspect-video bg-white/[0.06] border border-white/[0.12] rounded-xl relative overflow-hidden mx-auto">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 border-2 border-[#1565C0] rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#6191D3] rounded-lg" />
        </div>
        <div className="absolute top-0 left-1/2 w-px h-8 bg-[#1565C0] -translate-x-1/2 -translate-y-full" />
        <div className="absolute bottom-0 left-1/2 w-px h-8 bg-[#1565C0] -translate-x-1/2 translate-y-full" />
        <div className="absolute left-0 top-1/2 w-8 h-px bg-[#1565C0] -translate-y-1/2 -translate-x-full" />
        <div className="absolute right-0 top-1/2 w-8 h-px bg-[#1565C0] -translate-y-1/2 translate-x-full" />
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-[#64748B] font-mono">.kicad_pro</div>
    </div>
  );
}

function PreviewVisual() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="aspect-video bg-white/[0.06] border border-white/[0.12] rounded-xl mb-3 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-12 border border-[#1565C0]/50 bg-[#1565C0]/5 rounded-lg" />
        <div className="absolute bottom-2 left-2 text-xs text-[#64748B] font-serif">PCB Preview</div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#64748B] font-serif">Quote estimate:</span>
        <span className="text-[#1565C0] font-mono">$45–65/unit</span>
      </div>
    </div>
  );
}

function VisualMockup({ visual }: { visual: 'chat' | 'schema' | 'template' | 'bom' | 'kicad' | 'preview' }) {
  switch (visual) {
    case 'chat':
      return <ChatVisual />;
    case 'schema':
      return <SchemaVisual />;
    case 'template':
      return <TemplateVisual />;
    case 'bom':
      return <BOMVisual />;
    case 'kicad':
      return <KiCadVisual />;
    case 'preview':
      return <PreviewVisual />;
    default:
      return null;
  }
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof detailedFeatures)[0];
  index: number;
}) {
  const config = cardConfigs[index] ?? { span: '', intensity: 'medium' as const, tint: 'default' as const, spring: 'gentle' as const, noise: false };
  const isWide = config.span.includes('col-span-2');
  const isTall = config.span.includes('row-span-2');

  return (
    <LiquidGlassCard
      className={`${config.span} h-full`}
      glassIntensity={config.intensity}
      glassTint={config.tint}
      enableSpecular={true}
      enableNoise={config.noise}
      springConfig={config.spring}
    >
      <div className={`h-full p-6 sm:p-8 ${isWide && !isTall ? 'lg:grid lg:grid-cols-2 lg:gap-8' : 'flex flex-col'}`}>
        <div className="flex-1">
          <FeatureNumberBadge index={index} />

          <h2 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] font-serif mb-2 leading-tight">
            {feature.title}
          </h2>
          <p className="text-lg text-[#6191D3] font-medium font-serif mb-4">
            {feature.subtitle}
          </p>
          <p className="text-[#94A3B8] font-serif mb-6 leading-relaxed">
            {feature.description}
          </p>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-[#E2E8F0] font-serif text-sm tracking-wide uppercase">
              Capabilities
            </h3>
            <CapabilityList capabilities={feature.capabilities} />
          </div>

          <UseCaseBox useCase={feature.useCase} />
        </div>

        <div className={`${isWide && !isTall ? 'flex items-center' : 'mt-8 pt-6 border-t border-white/[0.08]'}`}>
          <div className="w-full">
            <VisualMockup visual={feature.visual} />
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  );
}

export default async function FeaturesPage() {
  const t = await getTranslations('features');

  return (
    <main className="pt-16">
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1565C0]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-elevated glass-specular p-10 sm:p-14 text-center rounded-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#E2E8F0] font-serif mb-6 leading-tight">
              <span className="text-[#1565C0]">{t('hero.title')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#94A3B8] font-serif max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {detailedFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-floating glass-specular p-10 sm:p-12 rounded-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] font-serif mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-[#94A3B8] font-serif mb-8 max-w-xl mx-auto">
              {t('cta.description')}
            </p>
            <a
              href="https://raino-studio.vercel.app"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1565C0] hover:bg-[#6191D3] text-white font-medium font-serif rounded-lg transition-colors duration-200"
            >
              {t('cta.button')}
              <span className="text-lg">→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
