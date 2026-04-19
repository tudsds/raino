import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raino — Documentation',
  description:
    'Get started with Raino, explore the architecture, and dive into the details. Full docs covering setup, deployment, security, ingestion, and UX.',
  openGraph: {
    title: 'Raino — Documentation',
    description: 'Get started with Raino, explore the architecture, and dive into the details.',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — Documentation',
    description: 'Get started with Raino, explore the architecture, and dive into the details.',
  },
};

const gettingStartedSteps = [
  {
    title: 'Clone',
    command: 'git clone https://github.com/tudsds/raino.git',
    description: 'Clone the repository to your local machine.',
  },
  {
    title: 'Install',
    command: 'cd raino && pnpm install',
    description: 'Install all dependencies across the monorepo.',
  },
  {
    title: 'Configure',
    command: 'cp .env.example .env.local',
    description: 'Copy the environment template and fill in your credentials.',
  },
  {
    title: 'Run',
    command: 'pnpm dev',
    description: 'Start the marketing site and studio in development mode.',
  },
];

const docSections = [
  {
    title: 'Architecture',
    href: 'https://github.com/tudsds/raino/tree/main/docs/architecture',
    description: 'System architecture, package structure, and worker services.',
    color: '#00f0ff',
    icon: '🏗️',
  },
  {
    title: 'API',
    href: 'https://github.com/tudsds/raino/tree/main/docs/api',
    description: 'API reference for routes, server actions, and worker contracts.',
    color: '#8b5cf6',
    icon: '🔌',
  },
  {
    title: 'Deployment',
    href: 'https://github.com/tudsds/raino/tree/main/docs/deployment',
    description: 'Guides for deploying to Vercel, Supabase setup, and environment variables.',
    color: '#00ff88',
    icon: '🚀',
  },
  {
    title: 'Security',
    href: 'https://github.com/tudsds/raino/tree/main/docs/security',
    description: 'Security model, RLS policies, auth flow, and credential handling.',
    color: '#ff3366',
    icon: '🔒',
  },
  {
    title: 'Ingestion',
    href: 'https://github.com/tudsds/raino/tree/main/docs/ingestion',
    description: 'Document ingestion pipeline, chunking, embeddings, and RAG.',
    color: '#ffaa00',
    icon: '📄',
  },
  {
    title: 'UX',
    href: 'https://github.com/tudsds/raino/tree/main/docs/ux',
    description: 'Design language, cyberpunk aesthetic, and component patterns.',
    color: '#ff00aa',
    icon: '🎨',
  },
];

export default function DocsPage() {
  return (
    <>
      <main className="pt-16">
        <section className="py-24 bg-[#0a0a0f] circuit-grid">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">
              <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-xl text-[#a1a1aa]">
              Get started with Raino, explore the architecture, and dive into the details.
            </p>
          </div>
        </section>

        <section className="py-24 bg-[#111118]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-12 text-center">
              Getting <span className="gradient-text">Started</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gettingStartedSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="p-6 bg-[#0a0a0f] border-2 border-[#27272a] hover:border-[#00f0ff]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-[#00f0ff]/10 border-2 border-[#00f0ff]/30 text-[#00f0ff] font-mono font-bold text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] text-[#e4e4e7]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[#a1a1aa] mb-4">{step.description}</p>
                  <div className="p-3 bg-[#1a1a24] border-2 border-[#27272a] font-mono text-sm text-[#00f0ff] overflow-x-auto">
                    {step.command}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-[#71717a] mb-4">
                For full setup instructions, environment variables, and troubleshooting:
              </p>
              <a
                href="https://github.com/tudsds/raino/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a0a0f] border-2 border-[#27272a] text-[#e4e4e7] font-semibold hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View README on GitHub
              </a>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-12 text-center">
              Documentation <span className="gradient-text">Sections</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docSections.map((section) => (
                <a
                  key={section.title}
                  href={section.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 bg-[#111118] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300"
                  style={{ borderColor: `${section.color}40` }}
                >
                  <div className="text-3xl mb-4">{section.icon}</div>
                  <h3
                    className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2"
                    style={{ color: section.color }}
                  >
                    {section.title}
                  </h3>
                  <p className="text-[#a1a1aa] text-sm">{section.description}</p>
                  <div
                    className="mt-4 flex items-center gap-2 text-sm"
                    style={{ color: section.color }}
                  >
                    <span>Read docs</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
