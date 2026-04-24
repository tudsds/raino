import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raino — Integrations',
  description:
    'Raino integrates with Kimi K2.5, Supabase, DigiKey, Mouser, JLCPCB, and KiCad. Every integration is built with honest fallback modes.',
  openGraph: {
    title: 'Raino — Integrations',
    description:
      'Raino connects to LLMs, databases, suppliers, and EDA tools with clear degraded-mode reporting and no silent fallbacks.',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/integrations',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — Integrations',
    description:
      'Raino connects to LLMs, databases, suppliers, and EDA tools with clear degraded-mode reporting and no silent fallbacks.',
  },
};

const integrations = [
  {
    name: 'Kimi K2.5',
    category: 'Large Language Model',
    description:
      'Raino uses Kimi K2.5 via the OpenAI-compatible API at moonshot.ai for natural language intake, clarifying questions, and structured reasoning. Every LLM call includes Zod-validated structured output and exponential backoff retry.',
    features: [
      'Natural language intake and parsing',
      'Multi-turn clarifying question generation',
      'RAG-assisted engineering reasoning',
      'Structured JSON output with Zod validation',
    ],
    status: 'Active',
    fallback: 'LLM calls fail gracefully with user-visible error messages',
    color: '#00f0ff',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-8 h-8"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: 'Supabase',
    category: 'Database & Auth',
    description:
      'Supabase provides Postgres with Row-Level Security, magic-link authentication, pgvector for embeddings, and storage for generated artifacts. Prisma ORM coexists with Supabase RLS for type-safe database access.',
    features: [
      'Postgres with Row-Level Security',
      'Magic-link authentication',
      'pgvector for embedding storage',
      'File storage for KiCad projects and exports',
    ],
    status: 'Active',
    fallback: 'Degraded mode: no persistence, auth prompts shown',
    color: '#00ff88',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-8 h-8"
      >
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    name: 'DigiKey',
    category: 'Component Supplier',
    description:
      'The DigiKey adapter queries real-time pricing, stock levels, and minimum order quantities through the DigiKey API. Every response includes source attribution and confidence scoring.',
    features: [
      'Real-time price queries',
      'Stock level and MOQ data',
      'Lifecycle status checks',
      'Alternate part suggestions',
    ],
    status: 'Active',
    fallback: 'Fixture mode with labeled estimates from historical data',
    color: '#ffaa00',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-8 h-8"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Mouser',
    category: 'Component Supplier',
    description:
      'The Mouser adapter provides cross-referenced pricing and availability data. When both DigiKey and Mouser are configured, Raino selects the best source per component and flags discrepancies.',
    features: [
      'Cross-referenced pricing',
      'Availability and lead times',
      'Multi-source comparison',
      'Discrepancy flagging',
    ],
    status: 'Active',
    fallback: 'Fixture mode with labeled estimates from historical data',
    color: '#ff6633',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-8 h-8"
      >
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    name: 'JLCPCB',
    category: 'PCB Fabrication',
    description:
      'The JLCPCB adapter queries PCB fabrication pricing, assembly costs, and component availability from the JLCPCB parts library. Supports both bare PCB and PCBA quote requests.',
    features: [
      'PCB fabrication pricing',
      'PCB assembly cost estimates',
      'JLC parts library matching',
      'PCBA handoff quote requests',
    ],
    status: 'Active',
    fallback: 'Fixture mode with labeled estimates from historical data',
    color: '#ff00aa',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-8 h-8"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: 'KiCad',
    category: 'EDA Tool',
    description:
      'KiCad is an external GPL-licensed EDA tool. Raino communicates through the KiCad CLI only. No KiCad source code is embedded. Generated projects include schematics, PCB layouts, design rules, and manufacturing exports.',
    features: [
      'Schematic generation via CLI',
      'PCB layout with DRC rules',
      'Gerber and drill exports',
      'Pick-and-place file generation',
    ],
    status: 'External Boundary',
    fallback: 'KiCad generation skipped; user notified with clear message',
    color: '#8b5cf6',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-8 h-8"
      >
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  return (
    <main className="pt-16">
      <section className="py-24 bg-[#0a0a0f] circuit-grid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">
            <span className="gradient-text">Integrations</span>
          </h1>
          <p className="text-xl text-[#a1a1aa]">
            Raino connects to the tools you already use. Every integration has a clear contract,
            honest fallback modes, and no silent degraded behavior.
          </p>
        </div>
      </section>

      <section className="py-24 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="group p-6 bg-[#0a0a0f] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300 flex flex-col"
                style={{ borderColor: `${integration.color}40` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div style={{ color: integration.color }}>{integration.icon}</div>
                  <span
                    className="px-2 py-1 text-xs font-mono border"
                    style={{
                      color: integration.color,
                      borderColor: `${integration.color}40`,
                      backgroundColor: `${integration.color}10`,
                    }}
                  >
                    {integration.status}
                  </span>
                </div>

                <div className="mb-3">
                  <h3
                    className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-1"
                    style={{ color: integration.color }}
                  >
                    {integration.name}
                  </h3>
                  <p className="text-xs text-[#71717a] font-mono uppercase tracking-wider">
                    {integration.category}
                  </p>
                </div>

                <p className="text-[#a1a1aa] text-sm mb-6 flex-grow">{integration.description}</p>

                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
                    Capabilities
                  </h4>
                  <ul className="space-y-1">
                    {integration.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                        <span style={{ color: integration.color }}>›</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#111118] border-2 border-[#27272a]">
                  <h4 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1">
                    Degraded Mode
                  </h4>
                  <p className="text-xs text-[#a1a1aa]">{integration.fallback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 bg-[#111118] border-2 border-[#27272a] text-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] mb-4">
              Integration <span className="gradient-text">Philosophy</span>
            </h2>
            <p className="text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
              Raino never pretends a live connection exists when it is using fixture data. Every
              degraded-mode path is inspectable through the audit trail. Mock adapters are
              permanent, honest fallbacks — not temporary scaffolding.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-[#0a0a0f] border-2 border-[#27272a]">
                <h3 className="text-[#00f0ff] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                  Clear Contracts
                </h3>
                <p className="text-sm text-[#a1a1aa]">
                  Every adapter implements a strict interface. Inputs and outputs are Zod-validated.
                </p>
              </div>
              <div className="p-4 bg-[#0a0a0f] border-2 border-[#27272a]">
                <h3 className="text-[#00ff88] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                  Honest Fallbacks
                </h3>
                <p className="text-sm text-[#a1a1aa]">
                  When credentials are missing, the system falls back to fixture data and says so.
                </p>
              </div>
              <div className="p-4 bg-[#0a0a0f] border-2 border-[#27272a]">
                <h3 className="text-[#ff00aa] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                  Audit Everything
                </h3>
                <p className="text-sm text-[#a1a1aa]">
                  Every adapter call, every fallback, every error is logged and inspectable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
