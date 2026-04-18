import Link from 'next/link';
import Navbar from '@/components/Navbar';

const packages = [
  {
    name: '@raino/core',
    description: 'Zod schemas, validation, quote engine, domain logic',
    color: '#00f0ff',
  },
  {
    name: '@raino/rag',
    description: 'Chunking, embeddings, retrieval for engineering documents',
    color: '#8b5cf6',
  },
  {
    name: '@raino/agents',
    description: 'Workflow contracts, orchestration, state machines',
    color: '#ff00aa',
  },
  {
    name: '@raino/ui',
    description: 'Shared React components, cyberpunk design system',
    color: '#00ff88',
  },
  {
    name: '@raino/kicad-worker-client',
    description: 'KiCad CLI contracts and job types',
    color: '#ffaa00',
  },
  {
    name: '@raino/supplier-clients',
    description: 'DigiKey, Mouser, JLCPCB adapter interfaces',
    color: '#ff3366',
  },
];

const services = [
  {
    name: 'ingest-worker',
    description:
      '8-stage document ingestion pipeline for datasheets, errata, and application notes',
    stages: ['Fetch', 'Parse', 'Chunk', 'Embed', 'Store', 'Index', 'Validate', 'Audit'],
  },
  {
    name: 'design-worker',
    description: 'KiCad project generation from approved architecture templates and BOM',
    stages: ['Load Template', 'Generate Schematic', 'Layout PCB', 'Run ERC/DRC', 'Export'],
  },
  {
    name: 'quote-worker',
    description: 'Rough quote calculation with confidence bands and assumption tracking',
    stages: ['Parse BOM', 'Query Suppliers', 'Calculate Costs', 'Apply Margins', 'Generate Report'],
  },
  {
    name: 'audit-worker',
    description: 'Traces, manifests, provenance tracking for every design decision',
    stages: ['Capture Event', 'Link Sources', 'Checksum', 'Store', 'Index', 'Export'],
  },
];

const boundaries = [
  {
    name: 'KiCad (GPL Boundary)',
    description:
      'KiCad is an external GPL-licensed EDA tool. Raino communicates through CLI commands only. No KiCad source code is embedded.',
    details: [
      'Communication via kicad-cli commands',
      'Job types defined in @raino/kicad-worker-client',
      'Generated designs have separate license considerations',
      'ERC/DRC validation on generated outputs',
    ],
  },
  {
    name: 'Supplier Adapters',
    description:
      'Interface + Adapter pattern for DigiKey, Mouser, and JLCPCB. No live credentials assumed.',
    details: [
      'Pluggable adapter interfaces',
      'Fixture mode with labeled estimates',
      'No direct database connections',
      'Clear degraded-mode reporting',
    ],
  },
  {
    name: 'RAG System',
    description:
      'Retrieval-augmented generation for engineering knowledge. NOT for live pricing or stock data.',
    details: [
      'Engineering document chunking and embedding',
      'Provenance tracking for every retrieval',
      'In-memory or vector database storage',
      'Explicit fixture/mock modes',
    ],
  },
];

function ArchitectureDiagram() {
  return (
    <div className="bg-[#0a0a0f] border-2 border-[#27272a] p-6 font-mono text-xs sm:text-sm overflow-x-auto">
      <pre className="text-[#a1a1aa] leading-relaxed">
        {`┌─────────────────────────────────────────────────────────────────┐
│                          Users                                   │
│                                                                  │
│   ┌──────────────────┐          ┌──────────────────────┐         │
│   │   apps/site      │          │     apps/studio      │         │
│   │   Marketing      │───CTA───▶│     Product App      │         │
│   │   raino-site      │          │     raino-studio     │         │
│   └──────────────────┘          └──────────┬───────────┘         │
│                                            │                     │
│                                    API Routes                    │
│                                            │                     │
│   ┌────────────────────────────────────────┴─────────────────┐   │
│   │                   packages/core                            │   │
│   │   Schemas · Validation · Quote Engine · Domain Logic       │   │
│   └──────┬─────────────┬─────────────┬─────────────┬───────────┘   │
│          │             │             │             │               │
│   ┌──────┴──┐   ┌──────┴──┐   ┌─────┴────┐   ┌────┴──────┐        │
│   │ packages/│   │ packages/│   │ packages/│   │ packages/ │        │
│   │ agents   │   │   rag    │   │kicad-w-c │   │supplier-c │        │
│   └─────────┘   └─────────┘   └──────────┘   └───────────┘        │
│                                                                    │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │                  Worker Services                         │      │
│   │  ingest-worker · design-worker · quote-worker · audit    │      │
│   └─────────────────────────────────────────────────────────┘      │
│                              │                                     │
│   ┌──────────────────────────┼──────────────────────────┐         │
│   │     External Boundaries  │                          │         │
│   │  ┌────────────────┐  ┌───┴──────────────┐          │         │
│   │  │    KiCad       │  │   Suppliers      │          │         │
│   │  │  (GPL CLI)     │  │ DigiKey/Mouser   │          │         │
│   │  └────────────────┘  │    /JLCPCB       │          │         │
│   │                      └──────────────────┘          │         │
│   └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘`}
      </pre>
    </div>
  );
}

function WorkflowDiagram() {
  return (
    <div className="bg-[#0a0a0f] border-2 border-[#27272a] p-6 font-mono text-xs sm:text-sm overflow-x-auto">
      <pre className="text-[#a1a1aa] leading-relaxed">
        {`┌─────────────────────────┐
│  Natural Language       │
│  Intake                 │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Clarifying Question    │
│  Loop                   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Structured Product     │
│  Specification          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Approved Architecture  │
│  Template Selection     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Candidate Part Family  │
│  Selection              │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Official Engineering   │
│  Document Ingestion     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Structured Supplier    │
│  Metadata Resolution    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  RAG-Assisted           │
│  Engineering Reasoning  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Full BOM with          │
│  Alternates             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  KiCad Project          │
│  Generation             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  ERC/DRC/Export         │
│  Workflow               │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Preview Asset          │
│  Generation             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Downloadable Artifact  │
│  Generation             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Raino Rough Quote      │
│  Generation             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Optional "Request      │
│  PCBA Quote" Handoff    │
└─────────────────────────┘`}
      </pre>
    </div>
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
            <Link href="/features" className="hover:text-[#00f0ff] transition-colors">
              Features
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

export default function ArchitecturePage() {
  return (
    <>
      <Navbar activePath="/architecture" />
      <main className="pt-16">
        <section className="py-24 bg-[#0a0a0f] circuit-grid">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">
              System <span className="gradient-text">Architecture</span>
            </h1>
            <p className="text-xl text-[#a1a1aa]">
              Raino is built as a modular system with clear boundaries. Each component has a defined
              responsibility and explicit interfaces.
            </p>
          </div>
        </section>

        <section className="py-24 bg-[#111118]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 text-center">
              High-Level <span className="gradient-text">Overview</span>
            </h2>
            <ArchitectureDiagram />
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-12 text-center">
              Package <span className="gradient-text">Structure</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="p-6 bg-[#111118] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300"
                  style={{ borderColor: `${pkg.color}40` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3" style={{ backgroundColor: pkg.color }} />
                    <code className="text-sm font-semibold" style={{ color: pkg.color }}>
                      {pkg.name}
                    </code>
                  </div>
                  <p className="text-[#a1a1aa] text-sm">{pkg.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#111118]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-12 text-center">
              Worker <span className="gradient-text">Services</span>
            </h2>
            <div className="space-y-8">
              {services.map((service) => (
                <div key={service.name} className="p-6 bg-[#0a0a0f] border-2 border-[#27272a]">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="lg:w-1/3">
                      <code className="text-[#00f0ff] font-semibold">{service.name}</code>
                      <p className="text-[#a1a1aa] text-sm mt-2">{service.description}</p>
                    </div>
                    <div className="lg:w-2/3">
                      <div className="flex flex-wrap gap-2">
                        {service.stages.map((stage, idx) => (
                          <div key={stage} className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-[#1a1a24] border-2 border-[#27272a] text-sm text-[#a1a1aa]">
                              {stage}
                            </span>
                            {idx < service.stages.length - 1 && (
                              <span className="text-[#71717a]">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-12 text-center">
              External <span className="gradient-text">Boundaries</span>
            </h2>
            <div className="space-y-6">
              {boundaries.map((boundary) => (
                <div key={boundary.name} className="p-6 bg-[#111118] border-2 border-[#27272a]">
                  <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-3 text-[#e4e4e7]">
                    {boundary.name}
                  </h3>
                  <p className="text-[#a1a1aa] mb-4">{boundary.description}</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {boundary.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-[#71717a]">
                        <span className="text-[#00f0ff]">›</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#111118]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 text-center">
              Product <span className="gradient-text">Workflow</span>
            </h2>
            <WorkflowDiagram />
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8 text-center">
              RAG <span className="gradient-text">Scope</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-[#111118] border-2 border-[#27272a]">
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4 text-[#00ff88]">
                  ✓ What RAG Is For
                </h3>
                <ul className="space-y-2 text-[#a1a1aa]">
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Datasheets and component specifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Errata documents from manufacturers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Application notes and reference designs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Package outlines and land patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Engineering knowledge retrieval</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-[#111118] border-2 border-[#27272a]">
                <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4 text-[#ff3366]">
                  ✗ What RAG Is NOT For
                </h3>
                <ul className="space-y-2 text-[#a1a1aa]">
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Live pricing data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Stock availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Minimum order quantities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Order placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>›</span>
                    <span>Any rapidly-changing data</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-center text-[#71717a] mt-8 text-sm">
              Quote source of truth is always structured supplier adapter output, never RAG
              retrieval.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
