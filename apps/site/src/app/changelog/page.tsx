import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raino — Changelog',
  description:
    'Version history and release notes for Raino. Track new features, fixes, and architectural improvements.',
  openGraph: {
    title: 'Raino — Changelog',
    description:
      'Version history and release notes. See what is new, what changed, and what is coming next.',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/changelog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — Changelog',
    description:
      'Version history and release notes. See what is new, what changed, and what is coming next.',
  },
};

const releases = [
  {
    version: '0.5.0',
    date: '2025-04-19',
    status: 'Current',
    color: '#00f0ff',
    changes: [
      {
        type: 'feature',
        text: 'Added marketing site pages: Showcase, Integrations, Changelog, and Trust',
      },
      {
        type: 'feature',
        text: 'Enhanced homepage with "Loved by Engineers" testimonials section',
      },
      {
        type: 'feature',
        text: 'Added integration logos grid to homepage',
      },
      {
        type: 'improvement',
        text: 'Improved mobile navigation with hamburger menu and click-outside-to-close',
      },
      {
        type: 'improvement',
        text: 'All pages now have unique titles and Open Graph meta tags',
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2025-03-15',
    status: 'Released',
    color: '#00ff88',
    changes: [
      {
        type: 'feature',
        text: 'Added Prisma ORM and Supabase persistence layer in @raino/db',
      },
      {
        type: 'feature',
        text: 'Implemented magic-link authentication via Supabase Auth',
      },
      {
        type: 'feature',
        text: 'Added Kimi K2.5 LLM gateway with structured output and retry logic',
      },
      {
        type: 'feature',
        text: 'Migrated RAG system to Supabase pgvector for embedding storage',
      },
      {
        type: 'improvement',
        text: 'Upgraded supplier clients with real API adapters + factory pattern',
      },
      {
        type: 'improvement',
        text: 'Enhanced pixel-art cyberpunk design system in @raino/ui',
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2025-02-01',
    status: 'Released',
    color: '#8b5cf6',
    changes: [
      {
        type: 'feature',
        text: 'Added quote-worker with confidence bands and assumption tracking',
      },
      {
        type: 'feature',
        text: 'Implemented audit-worker for provenance and trace logging',
      },
      {
        type: 'feature',
        text: 'Added DigiKey and Mouser supplier adapter interfaces',
      },
      {
        type: 'improvement',
        text: 'Refactored core schemas for stricter validation and better error messages',
      },
      {
        type: 'fix',
        text: 'Fixed BOM alternate part compatibility checking edge cases',
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2024-12-10',
    status: 'Released',
    color: '#ffaa00',
    changes: [
      {
        type: 'feature',
        text: 'Added design-worker for KiCad project generation via CLI',
      },
      {
        type: 'feature',
        text: 'Implemented ingest-worker 8-stage document pipeline',
      },
      {
        type: 'feature',
        text: 'Added JLCPCB supplier adapter for PCB fabrication quotes',
      },
      {
        type: 'improvement',
        text: 'Replaced mock embeddings with OpenAI-compatible embedding provider',
      },
      {
        type: 'improvement',
        text: 'Expanded README documentation with multi-language support',
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2024-10-22',
    status: 'Released',
    color: '#ff00aa',
    changes: [
      {
        type: 'feature',
        text: 'Initial release of Raino with core workflow pipeline',
      },
      {
        type: 'feature',
        text: 'Natural language intake with clarifying question loop',
      },
      {
        type: 'feature',
        text: 'Structured specification generation with validation',
      },
      {
        type: 'feature',
        text: 'Architecture template matching and constraint enforcement',
      },
      {
        type: 'feature',
        text: 'Marketing site and product studio Next.js apps',
      },
      {
        type: 'feature',
        text: 'Pixel-art cyberpunk design system with Press Start 2P and VT323 fonts',
      },
    ],
  },
];

const typeColors: Record<string, string> = {
  feature: '#00f0ff',
  improvement: '#00ff88',
  fix: '#ffaa00',
  breaking: '#ff3366',
};

const typeLabels: Record<string, string> = {
  feature: 'Feature',
  improvement: 'Improvement',
  fix: 'Fix',
  breaking: 'Breaking',
};

export default function ChangelogPage() {
  return (
    <main className="pt-16">
      <section className="py-24 bg-[#0a0a0f] circuit-grid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">
            <span className="gradient-text">Changelog</span>
          </h1>
          <p className="text-xl text-[#a1a1aa]">
            Version history and release notes. Track what is new, what changed, and what is coming
            next.
          </p>
        </div>
      </section>

      <section className="py-24 bg-[#111118]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {releases.map((release) => (
              <div
                key={release.version}
                className="relative pl-8 border-l-2"
                style={{ borderColor: `${release.color}40` }}
              >
                <div
                  className="absolute -left-[5px] top-0 w-2 h-2"
                  style={{ backgroundColor: release.color }}
                />

                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2
                      className="text-2xl font-bold font-[family-name:var(--font-heading)]"
                      style={{ color: release.color }}
                    >
                      v{release.version}
                    </h2>
                    <span className="text-sm text-[#71717a] font-mono">{release.date}</span>
                    {release.status === 'Current' && (
                      <span
                        className="px-2 py-1 text-xs font-mono border"
                        style={{
                          color: release.color,
                          borderColor: `${release.color}40`,
                          backgroundColor: `${release.color}10`,
                        }}
                      >
                        {release.status}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3">
                  {release.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="px-2 py-0.5 text-xs font-mono mt-0.5 shrink-0 border"
                        style={{
                          color: typeColors[change.type] || '#a1a1aa',
                          borderColor: `${typeColors[change.type] || '#a1a1aa'}40`,
                          backgroundColor: `${typeColors[change.type] || '#a1a1aa'}10`,
                        }}
                      >
                        {typeLabels[change.type] || change.type}
                      </span>
                      <span className="text-[#a1a1aa]">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] mb-6">
            Coming <span className="gradient-text">Soon</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-[#111118] border-2 border-[#27272a]">
              <h3 className="text-[#00f0ff] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                Team Workspaces
              </h3>
              <p className="text-sm text-[#a1a1aa]">
                Collaborate on hardware projects with shared specs, review workflows, and role-based
                permissions.
              </p>
            </div>
            <div className="p-6 bg-[#111118] border-2 border-[#27272a]">
              <h3 className="text-[#8b5cf6] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                Custom Architecture Templates
              </h3>
              <p className="text-sm text-[#a1a1aa]">
                Upload and validate your own architecture templates for domain-specific design
                reuse.
              </p>
            </div>
            <div className="p-6 bg-[#111118] border-2 border-[#27272a]">
              <h3 className="text-[#ff00aa] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                Live 3D Preview
              </h3>
              <p className="text-sm text-[#a1a1aa]">
                Interactive 3D board preview in the browser, powered by KiCad generated STEP files.
              </p>
            </div>
            <div className="p-6 bg-[#111118] border-2 border-[#27272a]">
              <h3 className="text-[#00ff88] font-semibold font-[family-name:var(--font-heading)] text-sm mb-2">
                API Access
              </h3>
              <p className="text-sm text-[#a1a1aa]">
                Programmatic access to the full workflow pipeline for CI/CD and automated design
                generation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
