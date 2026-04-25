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
 color: '#1565C0',
 icon: '🏗️',
 },
 {
 title: 'API',
 href: 'https://github.com/tudsds/raino/tree/main/docs/api',
 description: 'API reference for routes, server actions, and worker contracts.',
 color: '#6191D3',
 icon: '🔌',
 },
 {
 title: 'Deployment',
 href: 'https://github.com/tudsds/raino/tree/main/docs/deployment',
 description: 'Guides for deploying to Vercel, Supabase setup, and environment variables.',
 color: '#4CAF50',
 icon: '🚀',
 },
 {
 title: 'Security',
 href: 'https://github.com/tudsds/raino/tree/main/docs/security',
 description: 'Security model, RLS policies, auth flow, and credential handling.',
 color: '#EF5350',
 icon: '🔒',
 },
 {
 title: 'Ingestion',
 href: 'https://github.com/tudsds/raino/tree/main/docs/ingestion',
 description: 'Document ingestion pipeline, chunking, embeddings, and RAG.',
 color: '#FF9800',
 icon: '📄',
 },
 {
 title: 'UX',
 href: 'https://github.com/tudsds/raino/tree/main/docs/ux',
 description: 'Design language, liquid glass aesthetic, and component patterns.',
 color: '#1565C0',
 icon: '🎨',
 },
];

export default function DocsPage() {
 return (
 <>
 <main className="pt-16">
 <section className="py-24 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
 <div className="max-w-4xl mx-auto px-4 text-center">
 <h1 className="text-4xl sm:text-5xl font-bold text-[#E2E8F0] mb-6">
 <span className="text-[#1565C0]">Documentation</span>
 </h1>
 <p className="text-xl text-[#94A3B8]">
 Get started with Raino, explore the architecture, and dive into the details.
 </p>
 </div>
 </section>

 <section className="py-24 bg-[#0D2137]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-[#E2E8F0] mb-12 text-center">
 Getting <span className="text-[#1565C0]">Started</span>
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {gettingStartedSteps.map((step, index) => (
 <div
 key={step.title}
 className="p-6 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
 >
 <div className="flex items-center gap-3 mb-4">
 <span className="flex items-center justify-center w-8 h-8 bg-[#1565C0]/10 border border-[#1565C0]/30 text-[#1565C0] font-[family-name:var(--font-body)] font-bold text-sm rounded-lg">
 {String(index + 1).padStart(2, '0')}
 </span>
 <h3 className="text-xl font-semibold text-[#E2E8F0]">
 {step.title}
 </h3>
 </div>
 <p className="text-[#94A3B8] mb-4">{step.description}</p>
 <div className="p-3 bg-white/[0.06] border border-white/[0.12] rounded-xl font-[family-name:var(--font-body)] text-sm text-[#1565C0] overflow-x-auto">
 {step.command}
 </div>
 </div>
 ))}
 </div>
 <div className="mt-12 text-center">
 <p className="text-[#64748B] mb-4">
 For full setup instructions, environment variables, and troubleshooting:
 </p>
 <a
 href="https://github.com/tudsds/raino/blob/main/README.md"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] font-semibold rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
 </svg>
 View README on GitHub
 </a>
 </div>
 </div>
 </section>

 <section className="py-24 bg-[#0A1929]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-[#E2E8F0] mb-12 text-center">
 Documentation <span className="text-[#1565C0]">Sections</span>
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {docSections.map((section) => (
 <a
 key={section.title}
 href={section.href}
 target="_blank"
 rel="noopener noreferrer"
 className="group p-6 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
 >
 <div className="text-3xl mb-4">{section.icon}</div>
 <h3
 className="text-xl font-semibold mb-2"
 style={{ color: section.color }}
 >
 {section.title}
 </h3>
 <p className="text-[#94A3B8] text-sm">{section.description}</p>
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
