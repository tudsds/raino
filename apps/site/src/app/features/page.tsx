import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
    visual: 'chat',
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
    visual: 'schema',
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
      'Custom template upload (enterprise)',
    ],
    useCase:
      'Based on the sensor board requirements, Raino recommends the "Low-Power Sensor Node" template, which includes validated power management and communication subcircuits.',
    visual: 'template',
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
    visual: 'bom',
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
    visual: 'kicad',
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
    visual: 'preview',
  },
];

function FeatureCard({ feature, index }: { feature: (typeof detailedFeatures)[0]; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <section className={`py-24 ${isEven ? 'bg-[#0a0a0f]' : 'bg-[#111118]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
        >
          <div className={isEven ? '' : 'lg:order-2'}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00f0ff]/10 border-2 border-[#00f0ff]/30 text-sm text-[#00f0ff] font-mono mb-4">
              Feature {String(index + 1).padStart(2, '0')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-2">
              {feature.title}
            </h2>
            <p className="text-xl text-[#8b5cf6] mb-6">{feature.subtitle}</p>
            <p className="text-[#a1a1aa] mb-8">{feature.description}</p>

            <div className="space-y-4 mb-8">
              <h3 className="font-semibold font-[family-name:var(--font-heading)] text-[#e4e4e7]">
                Capabilities
              </h3>
              <ul className="space-y-2">
                {feature.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="text-[#00f0ff] mt-1">›</span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#1a1a24] border-2 border-[#27272a]">
              <h4 className="text-sm font-semibold text-[#71717a] mb-2">Use Case Example</h4>
              <p className="text-sm text-[#a1a1aa]">{feature.useCase}</p>
            </div>
          </div>

          <div className={`${isEven ? '' : 'lg:order-1'}`}>
            <div className="aspect-video bg-[#0a0a0f] border-2 border-[#27272a] p-6 flex items-center justify-center">
              {feature.visual === 'chat' && (
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#8b5cf6] flex items-center justify-center text-xs font-bold">
                      U
                    </div>
                    <div className="flex-1 p-3 bg-[#1a1a24]-none text-sm text-[#a1a1aa]">
                      I need a sensor board with 5V input, I2C interface, and 40x30mm dimensions
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#00f0ff] flex items-center justify-center text-xs font-bold text-[#0a0a0f]">
                      R
                    </div>
                    <div className="flex-1 p-3 bg-[#111118] border-2 border-[#00f0ff]/30-none text-sm text-[#a1a1aa]">
                      What type of sensor? Temperature, accelerometer, or something else?
                    </div>
                  </div>
                </div>
              )}
              {feature.visual === 'schema' && (
                <div className="w-full max-w-sm space-y-2 font-mono text-xs">
                  <div className="p-3 bg-[#1a1a24] border-l-2 border-[#00f0ff]">
                    <span className="text-[#00f0ff]">power_input:</span>
                    <span className="text-[#a1a1aa]"> 5V ±5%</span>
                  </div>
                  <div className="p-3 bg-[#1a1a24] border-l-2 border-[#8b5cf6]">
                    <span className="text-[#8b5cf6]">interface:</span>
                    <span className="text-[#a1a1aa]"> I2C @ 400kHz</span>
                  </div>
                  <div className="p-3 bg-[#1a1a24] border-l-2 border-[#ff00aa]">
                    <span className="text-[#ff00aa]">dimensions:</span>
                    <span className="text-[#a1a1aa]"> 40mm × 30mm</span>
                  </div>
                </div>
              )}
              {feature.visual === 'template' && (
                <div className="w-full max-w-sm p-4 bg-[#111118] border-2 border-[#27272a]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#00f0ff]/10 border-2 border-[#00f0ff]/30 flex items-center justify-center">
                      <span className="text-[#00f0ff] text-lg">◎</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#e4e4e7]">Low-Power Sensor Node</div>
                      <div className="text-xs text-[#71717a]">Template #247</div>
                    </div>
                  </div>
                  <div className="text-xs text-[#71717a] space-y-1">
                    <div className="flex justify-between">
                      <span>Power:</span> <span className="text-[#a1a1aa]">3.3V / 5V</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interfaces:</span>{' '}
                      <span className="text-[#a1a1aa]">I2C, SPI, UART</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validation:</span> <span className="text-[#00ff88]">✓ Production</span>
                    </div>
                  </div>
                </div>
              )}
              {feature.visual === 'bom' && (
                <div className="w-full max-w-sm">
                  <div className="text-xs font-mono text-[#71717a] mb-2">
                    Bill of Materials (3 items)
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-[#1a1a24] text-sm">
                      <span className="text-[#a1a1aa]">MCP9808T-E/MS</span>
                      <span className="text-[#00ff88] text-xs">$2.45</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#1a1a24] text-sm">
                      <span className="text-[#a1a1aa]">TPS563201DDCR</span>
                      <span className="text-[#00ff88] text-xs">$0.89</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#1a1a24] text-sm">
                      <span className="text-[#a1a1aa]">STM32L072KZ</span>
                      <span className="text-[#ffaa00] text-xs">$4.20 ⚠</span>
                    </div>
                  </div>
                </div>
              )}
              {feature.visual === 'kicad' && (
                <div className="w-full max-w-sm aspect-video bg-[#0a0a0f] border-2 border-[#27272a] relative overflow-hidden">
                  <div className="absolute inset-0 circuit-grid opacity-50" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 border-2 border-[#00f0ff] flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#8b5cf6]" />
                    </div>
                    <div className="absolute top-0 left-1/2 w-px h-8 bg-[#00f0ff] -translate-x-1/2 -translate-y-full" />
                    <div className="absolute bottom-0 left-1/2 w-px h-8 bg-[#00f0ff] -translate-x-1/2 translate-y-full" />
                    <div className="absolute left-0 top-1/2 w-8 h-px bg-[#00f0ff] -translate-y-1/2 -translate-x-full" />
                    <div className="absolute right-0 top-1/2 w-8 h-px bg-[#00f0ff] -translate-y-1/2 translate-x-full" />
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-[#71717a] font-mono">
                    .kicad_pro
                  </div>
                </div>
              )}
              {feature.visual === 'preview' && (
                <div className="w-full max-w-sm">
                  <div className="aspect-video bg-[#1a1a24] mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 circuit-grid opacity-30" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-12 border-2 border-[#00f0ff]/50 bg-[#00f0ff]/5" />
                    <div className="absolute bottom-2 left-2 text-xs text-[#71717a]">
                      PCB Preview
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#71717a]">Quote estimate:</span>
                    <span className="text-[#00f0ff] font-mono">$45–65/unit</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-[#0a0a0f] border-t border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-[family-name:var(--font-heading)]">
              RA<span className="text-[#00f0ff]">I</span>NO
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#71717a]">
            <Link href="/" className="hover:text-[#00f0ff] transition-colors">
              Home
            </Link>
            <Link href="/architecture" className="hover:text-[#00f0ff] transition-colors">
              Architecture
            </Link>
            <a
              href="https://github.com/tudsds/raino"
              className="hover:text-[#00f0ff] transition-colors"
            >
              GitHub
            </a>
          </div>
          <p className="text-sm text-[#71717a]">© 2024 Raino. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <Navbar activePath="/features" />
      <main className="pt-16">
        <section className="py-24 bg-[#0a0a0f] circuit-grid">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">
              <span className="gradient-text">Features</span>
            </h1>
            <p className="text-xl text-[#a1a1aa]">
              Every capability in Raino is designed for production hardware workflows. No gimmicks.
              No autopilot. Just structured engineering.
            </p>
          </div>
        </section>
        {detailedFeatures.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </main>
      <Footer />
    </>
  );
}
