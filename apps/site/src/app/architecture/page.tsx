import type { Metadata } from 'next';

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

function ConnectionLine({ direction = 'vertical' }: { direction?: 'vertical' | 'horizontal' }) {
  if (direction === 'horizontal') {
    return (
      <div className="flex items-center justify-center w-full px-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1565C0]/40 to-transparent" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-px h-6 bg-gradient-to-b from-[#1565C0]/40 to-[#6191D3]/20" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#6191D3]/40" />
    </div>
  );
}

function GlassCard({
  children,
  className = '',
  tint = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  tint?: 'default' | 'accent' | 'external';
}) {
  const tintClasses = {
    default: 'bg-white/[0.06] border-white/[0.12] hover:bg-white/[0.10] hover:border-white/[0.20]',
    accent: 'bg-[#1565C0]/[0.08] border-[#1565C0]/[0.20] hover:bg-[#1565C0]/[0.12] hover:border-[#1565C0]/[0.30]',
    external: 'bg-[#64748B]/[0.06] border-[#64748B]/[0.15] hover:bg-[#64748B]/[0.10] hover:border-[#64748B]/[0.25]',
  };

  return (
    <div
      className={`backdrop-blur-xl rounded-xl transition-all duration-300 hover:scale-[1.02] ${tintClasses[tint]} ${className}`}
    >
      {children}
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="flex flex-col items-center gap-0 max-w-5xl mx-auto">
      <GlassCard className="px-8 py-4 w-full max-w-xs text-center" tint="accent">
        <div className="text-white font-serif text-lg font-semibold">Users</div>
        <div className="text-[#64748B] text-xs mt-1">Engineers · Makers · Teams</div>
      </GlassCard>

      <ConnectionLine />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full items-center">
        <GlassCard className="px-6 py-4 text-center" tint="default">
          <div className="text-white font-mono text-sm font-semibold">apps/site</div>
          <div className="text-[#6191D3] text-xs mt-1">Marketing</div>
          <div className="text-[#64748B] text-xs">Port 3000</div>
        </GlassCard>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 w-full px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1565C0]/40" />
            <span className="text-[#6191D3] text-xs font-mono whitespace-nowrap">CTA</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1565C0]/40" />
          </div>
        </div>

        <GlassCard className="px-6 py-4 text-center" tint="default">
          <div className="text-white font-mono text-sm font-semibold">apps/studio</div>
          <div className="text-[#6191D3] text-xs mt-1">Product App</div>
          <div className="text-[#64748B] text-xs">Port 3001</div>
        </GlassCard>
      </div>

      <ConnectionLine />

      <div className="text-[#64748B] text-xs font-mono mb-1">Route Handlers + Server Actions</div>

      <ConnectionLine />

      <GlassCard className="px-8 py-5 w-full max-w-lg text-center" tint="accent">
        <div className="text-white font-mono text-sm font-semibold">packages/core</div>
        <div className="text-[#6191D3] text-xs mt-2">
          Schemas · Validation · Quote Engine · Domain Logic
        </div>
      </GlassCard>

      <ConnectionLine />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {[
          { name: 'packages/db', label: 'ORM + Auth', sub: '@raino/db' },
          { name: 'packages/llm', label: 'Kimi Gateway', sub: '@raino/llm' },
          { name: 'packages/rag', label: 'Retrieval', sub: '@raino/rag' },
          { name: 'packages/agents', label: 'Orchestration', sub: '@raino/agents' },
          { name: 'packages/ui', label: 'Design System', sub: '@raino/ui' },
          { name: 'packages/kicad', label: 'KiCad CLI', sub: 'kicad-worker-client' },
          { name: 'packages/supplier', label: 'Suppliers', sub: 'supplier-clients' },
        ].map((pkg) => (
          <GlassCard key={pkg.name} className="px-4 py-3 text-center" tint="default">
            <div className="text-white font-mono text-xs font-semibold">{pkg.name}</div>
            <div className="text-[#6191D3] text-xs mt-1">{pkg.label}</div>
            <div className="text-[#64748B] text-[10px] mt-0.5">{pkg.sub}</div>
          </GlassCard>
        ))}
      </div>

      <ConnectionLine />

      <GlassCard className="px-6 py-4 w-full" tint="default">
        <div className="text-white font-mono text-sm font-semibold text-center mb-3">
          Worker Services
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'ingest-worker', color: '#1565C0' },
            { name: 'design-worker', color: '#6191D3' },
            { name: 'quote-worker', color: '#1565C0' },
            { name: 'audit-worker', color: '#6191D3' },
          ].map((svc) => (
            <div
              key={svc.name}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center"
            >
              <div className="text-white text-xs font-mono">{svc.name}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <ConnectionLine />

      <GlassCard className="px-6 py-5 w-full" tint="external">
        <div className="text-white font-serif text-sm font-semibold text-center mb-4">
          External Boundaries
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="px-4 py-3 rounded-lg bg-[#0A1929]/60 border border-[#64748B]/[0.15] text-center">
            <div className="text-white text-xs font-mono font-semibold">Supabase</div>
            <div className="text-[#64748B] text-[10px] mt-1">Auth · Postgres · pgvector</div>
          </div>
          <div className="px-4 py-3 rounded-lg bg-[#0A1929]/60 border border-[#64748B]/[0.15] text-center">
            <div className="text-white text-xs font-mono font-semibold">KiCad CLI</div>
            <div className="text-[#64748B] text-[10px] mt-1">GPL Boundary</div>
          </div>
          <div className="px-4 py-3 rounded-lg bg-[#0A1929]/60 border border-[#64748B]/[0.15] text-center">
            <div className="text-white text-xs font-mono font-semibold">Suppliers</div>
            <div className="text-[#64748B] text-[10px] mt-1">DigiKey · Mouser · JLCPCB</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function WorkflowDiagram() {
  const stages = [
    'Natural Language Intake',
    'Clarifying Question Loop',
    'Structured Product Specification',
    'Approved Architecture Template Selection',
    'Candidate Part Family Selection',
    'Official Engineering Document Ingestion',
    'Structured Supplier Metadata Resolution',
    'RAG-Assisted Engineering Reasoning',
    'Full BOM with Alternates',
    'KiCad Project Generation',
    'ERC/DRC/Export Workflow',
    'Preview Asset Generation',
    'Downloadable Artifact Generation',
    'Raino Rough Quote Generation',
    'Optional "Request PCBA Quote" Handoff',
  ];

  return (
    <div className="flex flex-col items-center gap-0 max-w-xl mx-auto">
      {stages.map((stage, idx) => (
        <div key={stage} className="w-full flex flex-col items-center">
          <GlassCard className="px-6 py-3 w-full text-center" tint={idx === 0 ? 'accent' : 'default'}>
            <span className="text-white text-sm font-medium">{stage}</span>
          </GlassCard>
          {idx < stages.length - 1 && (
            <div className="flex flex-col items-center py-1.5">
              <div className="w-px h-4 bg-gradient-to-b from-[#1565C0]/30 to-[#6191D3]/20" />
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#6191D3]/30" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
