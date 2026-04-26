import type { Metadata } from 'next';
import {
  GlassCard,
  ArchitectureDiagram,
  WorkflowDiagram,
} from '@raino/ui';

export const metadata: Metadata = {
  title: 'Raino — Architecture',
  description:
    'Raino is built as a modular system with clear boundaries. Marketing site, product studio, core packages, worker services, and external boundaries.',
  openGraph: {
    title: 'Raino — Architecture',
    description:
      'Modular system architecture with defined responsibilities and explicit interfaces across packages, services, and external boundaries.',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/architecture',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — Architecture',
    description:
      'Modular system architecture with defined responsibilities and explicit interfaces across packages, services, and external boundaries.',
  },
};

const packages = [
  {
    name: '@raino/core',
    description: 'Zod schemas, validation, quote engine, domain logic',
    color: '#1565C0',
  },
  {
    name: '@raino/db',
    description: 'Prisma ORM, Supabase auth, storage, and pgvector clients',
    color: '#4CAF50',
  },
  {
    name: '@raino/llm',
    description: 'Kimi K2.5 gateway, structured output, retry logic',
    color: '#1565C0',
  },
  {
    name: '@raino/rag',
    description: 'Chunking, embeddings, retrieval for engineering documents',
    color: '#6191D3',
  },
  {
    name: '@raino/agents',
    description: 'Workflow contracts, orchestration, state machines',
    color: '#EF5350',
  },
  {
    name: '@raino/ui',
    description: 'Shared React components, liquid glass design system',
    color: '#4CAF50',
  },
  {
    name: '@raino/kicad-worker-client',
    description: 'KiCad CLI contracts and job types',
    color: '#FF9800',
  },
  {
    name: '@raino/supplier-clients',
    description: 'DigiKey, Mouser, JLCPCB adapter interfaces + factory',
    color: '#FF9800',
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
      'Supabase pgvector storage',
      'Explicit fixture/mock modes',
    ],
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <main className="pt-16">
        <section className="py-24 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-6">
              System <span className="text-[#1565C0]">Architecture</span>
            </h1>
            <p className="text-xl text-[#64748B]">
              Raino is built as a modular system with clear boundaries. Each component has a defined
              responsibility and explicit interfaces.
            </p>
          </div>
        </section>

        <section className="py-24 bg-[#0D2137]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white font-serif mb-12 text-center">
              High-Level <span className="text-[#1565C0]">Overview</span>
            </h2>
            <ArchitectureDiagram />
          </div>
        </section>

        <section className="py-24 bg-[#0A1929]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white font-serif mb-12 text-center">
              Package <span className="text-[#1565C0]">Structure</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <GlassCard key={pkg.name} className="p-6" tint="default">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#1565C0]" />
                    <code className="text-sm font-semibold text-[#6191D3]">{pkg.name}</code>
                  </div>
                  <p className="text-[#64748B] text-sm">{pkg.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0D2137]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white font-serif mb-12 text-center">
              Worker <span className="text-[#1565C0]">Services</span>
            </h2>
            <div className="space-y-8">
              {services.map((service) => (
                <GlassCard key={service.name} className="p-6" tint="default">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="lg:w-1/3">
                      <code className="text-[#1565C0] font-semibold">{service.name}</code>
                      <p className="text-[#64748B] text-sm mt-2">{service.description}</p>
                    </div>
                    <div className="lg:w-2/3">
                      <div className="flex flex-wrap gap-2 items-center">
                        {service.stages.map((stage, idx) => (
                          <div key={stage} className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/[0.06] border border-white/[0.12] text-sm text-[#64748B] rounded-lg backdrop-blur-sm">
                              {stage}
                            </span>
                            {idx < service.stages.length - 1 && (
                              <span className="text-[#1565C0]/60">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0A1929]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white font-serif mb-12 text-center">
              External <span className="text-[#1565C0]">Boundaries</span>
            </h2>
            <div className="space-y-6">
              {boundaries.map((boundary) => (
                <GlassCard key={boundary.name} className="p-6" tint="external">
                  <h3 className="text-xl font-semibold text-white font-serif mb-3">
                    {boundary.name}
                  </h3>
                  <p className="text-[#64748B] mb-4">{boundary.description}</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {boundary.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-[#64748B]">
                        <span className="text-[#1565C0]">›</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0D2137]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white font-serif mb-12 text-center">
              Product <span className="text-[#1565C0]">Workflow</span>
            </h2>
            <WorkflowDiagram />
          </div>
        </section>

        <section className="py-24 bg-[#0A1929]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white font-serif mb-8 text-center">
              RAG <span className="text-[#1565C0]">Scope</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassCard className="p-6" tint="default">
                <h3 className="text-lg font-semibold text-[#6191D3] font-serif mb-4">
                  ✓ What RAG Is For
                </h3>
                <ul className="space-y-2 text-[#64748B]">
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
              </GlassCard>
              <GlassCard className="p-6" tint="external">
                <h3 className="text-lg font-semibold text-[#64748B] font-serif mb-4">
                  ✗ What RAG Is NOT For
                </h3>
                <ul className="space-y-2 text-[#64748B]">
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
              </GlassCard>
            </div>
            <p className="text-center text-[#64748B] mt-8 text-sm">
              Quote source of truth is always structured supplier adapter output, never RAG
              retrieval.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
