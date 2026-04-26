import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { LiquidGlassCard } from '@raino/ui';

const ArchitectureDiagram = dynamic(
  () => import('@raino/ui/diagrams').then((mod) => mod.ArchitectureDiagram),
  { loading: () => <div className="h-96 animate-pulse bg-white/[0.03] rounded-2xl" /> },
);

export const metadata: Metadata = {
  title: 'Raino — Agentic PCB Design',
  description:
    'Raino converts fuzzy hardware intent into structured specs, selects approved architectures, and generates KiCad projects with full audit trails.',
  openGraph: {
    title: 'Raino — Agentic PCB Design',
    description:
      'Turn vague hardware ideas into manufacturing-ready PCB bundles with structured intelligence',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — Agentic PCB Design',
    description:
      'Turn vague hardware ideas into manufacturing-ready PCB bundles with structured intelligence',
  },
};

const features = [
  {
    title: 'Natural Language Intake',
    description:
      'Describe hardware in plain language. Raino understands your intent and asks clarifying questions to build a complete specification.',
    icon: '💬',
    span: 'col-span-1 md:col-span-2',
  },
  {
    title: 'Structured Specifications',
    description:
      'Fuzzy intent becomes precise specs. Every requirement is captured, validated, and traced through the entire workflow.',
    icon: '📋',
    span: 'col-span-1',
  },
  {
    title: 'Approved Architectures',
    description:
      'Constrained architecture selection ensures designs stay within validated templates. No unconstrained autopilot.',
    icon: '🏗️',
    span: 'col-span-1',
  },
  {
    title: 'Intelligent BOM',
    description:
      'Full bill of materials with sourcing data, alternates, and risk indicators. Every part traceable to its source.',
    icon: '📦',
    span: 'col-span-1 md:col-span-2',
  },
  {
    title: 'KiCad Generation',
    description:
      'Automated schematic and PCB generation. Raino produces production-ready KiCad projects, not suggestions.',
    icon: '⚡',
    span: 'col-span-1',
  },
  {
    title: 'Manufacturing Handoff',
    description:
      'Previews, downloads, rough quotes, and optional PCBA handoff. Everything you need to go from design to production.',
    icon: '🚀',
    span: 'col-span-1 md:col-span-2',
  },
];

const workflowSteps = [
  { num: 1, title: 'Natural Language Intake', desc: 'Describe your hardware in plain language' },
  { num: 2, title: 'Clarifying Questions', desc: 'Raino resolves ambiguities before proceeding' },
  { num: 3, title: 'Structured Specification', desc: 'Formal requirements with validation' },
  { num: 4, title: 'Architecture Selection', desc: 'Approved template matched to your needs' },
  { num: 5, title: 'Part Family Selection', desc: 'Candidate components with sourcing data' },
  { num: 6, title: 'Document Ingestion', desc: 'Datasheets, errata, and app notes analyzed' },
  { num: 7, title: 'Supplier Metadata', desc: 'Real prices, stock, and MOQs from suppliers' },
  { num: 8, title: 'RAG Reasoning', desc: 'Engineering knowledge informs design decisions' },
  { num: 9, title: 'BOM Generation', desc: 'Full BOM with alternates and risk indicators' },
  { num: 10, title: 'KiCad Project', desc: 'Production-ready schematic and PCB files' },
  { num: 11, title: 'Validation & Export', desc: 'ERC/DRC checks and manufacturing exports' },
  { num: 12, title: 'Quote & Handoff', desc: 'Rough quote with confidence bands' },
];

const testimonials = [
  {
    quote:
      'Raino cut our early-stage schematic time from two weeks to three days. The structured spec meant our senior engineer reviewed intent, not pinouts.',
    author: 'Engineering Lead',
    company: 'Industrial IoT Startup',
    color: '#1565C0',
  },
  {
    quote:
      'The BOM with real alternates saved us during the 2023 chip shortage. Raino had already flagged lifecycle risks before we even ordered.',
    author: 'Hardware Engineer',
    company: 'Robotics Company',
    color: '#6191D3',
  },
  {
    quote:
      'I described a motor driver in a paragraph and got a KiCad project with ERC passing. The clarifying questions caught a voltage level mismatch I would have missed.',
    author: 'Founder',
    company: 'Agricultural Sensor Platform',
    color: '#4CAF50',
  },
];

const integrationLogos = [
  { name: 'Kimi', category: 'LLM', color: '#1565C0' },
  { name: 'Supabase', category: 'Database', color: '#4CAF50' },
  { name: 'DigiKey', category: 'Supplier', color: '#FF9800' },
  { name: 'Mouser', category: 'Supplier', color: '#FF9800' },
  { name: 'JLCPCB', category: 'Fabrication', color: '#1565C0' },
  { name: 'KiCad', category: 'EDA', color: '#6191D3' },
];

const fluid = {
  display: 'clamp(3rem, 6vw + 1rem, 6rem)',
  h2: 'clamp(2rem, 4vw + 0.5rem, 3.5rem)',
  h3: 'clamp(1.25rem, 2vw + 0.5rem, 2rem)',
  bodyLarge: 'clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem)',
  body: 'clamp(1rem, 1vw + 0.5rem, 1.25rem)',
  small: 'clamp(0.75rem, 0.5vw + 0.5rem, 0.875rem)',
};

async function Hero() {
  const t = await getTranslations('home');

  return (
    <section className="relative min-h-screen flex items-center bg-[#0A1929] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 20% 50%, rgba(21, 101, 192, 0.55) 0%, rgba(21, 101, 192, 0.25) 40%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 80% 20%, rgba(21, 101, 192, 0.2) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="glass-blue-tint glass-noise p-8 sm:p-12 rounded-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-surface rounded-xl mb-8">
                <span className="w-2 h-2 bg-[#4CAF50] rounded-full animate-subtle-pulse" />
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  {t('hero.badge')}
                </span>
              </div>
              <h1
                className="font-bold text-[#E2E8F0] leading-[1.1] mb-6"
                style={{ fontSize: fluid.display, letterSpacing: '-0.02em' }}
              >
                {t('hero.title', { accent: t('hero.titleAccent') })}
              </h1>
              <p
                className="mb-10 max-w-xl"
                style={{ fontSize: fluid.bodyLarge, color: '#94A3B8', lineHeight: 1.6 }}
              >
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href={process.env.NEXT_PUBLIC_APP_URL}
                  className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
                >
                  {t('hero.getStarted')}
                </a>
                <a
                  href="https://github.com/tudsds/raino"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 glass-surface text-[#E2E8F0] font-semibold rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
                >
                  {t('hero.viewOnGithub')}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">
            <div className="glass-elevated glass-specular glass-noise p-6 rounded-xl self-end max-w-xs">
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#64748B' }}>
                {t('stats.workflowSteps')}
              </div>
              <div className="text-4xl font-bold text-[#E2E8F0]">{t('stats.workflowStepsValue')}</div>
              <div className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                {t('stats.workflowStepsDesc')}
              </div>
            </div>
            <div className="glass-surface glass-noise p-6 rounded-xl self-start max-w-sm">
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#64748B' }}>
                {t('stats.architectureTemplates')}
              </div>
              <div className="text-4xl font-bold text-[#E2E8F0]">{t('stats.architectureTemplatesValue')}</div>
              <div className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                {t('stats.architectureTemplatesDesc')}
              </div>
            </div>
            <div className="glass-floating glass-specular glass-noise p-6 rounded-xl self-center max-w-xs">
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#64748B' }}>
                {t('stats.output')}
              </div>
              <div className="text-4xl font-bold text-[#E2E8F0]">{t('stats.outputValue')}</div>
              <div className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                {t('stats.outputDesc')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function Features() {
  const t = await getTranslations('home.features');

  return (
    <section className="py-24 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <h2
            className="font-bold text-[#E2E8F0] mb-4"
            style={{ fontSize: fluid.h2, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {t('title', { accent: t('titleAccent') })}
          </h2>
          <p style={{ fontSize: fluid.body, color: '#94A3B8', lineHeight: 1.6 }}>
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {features.map((feature) => (
            <LiquidGlassCard
              key={feature.title}
              glassIntensity="medium"
              glassTint="default"
              enableNoise
              enableSpecular
              springConfig="smooth"
              className={feature.span}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3
                  className="font-semibold mb-2 text-[#E2E8F0]"
                  style={{ fontSize: fluid.h3 }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: fluid.small, color: '#94A3B8', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

async function LovedByEngineers() {
  const t = await getTranslations('home.testimonials');

  return (
    <section className="py-24 bg-[#0D2137]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <h2
            className="font-bold text-[#E2E8F0] mb-4"
            style={{ fontSize: fluid.h2, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {t('title', { accent: t('titleAccent') })}
          </h2>
          <p style={{ fontSize: fluid.body, color: '#94A3B8', lineHeight: 1.6 }}>
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <LiquidGlassCard
              key={t.author}
              glassIntensity="medium"
              enableNoise
              enableSpecular
              springConfig="gentle"
              className={idx === 1 ? 'md:mt-10' : ''}
            >
              <div className="p-6 glass-specular h-full flex flex-col">
                <div className="mb-6">
                  <svg
                    className="w-8 h-8 opacity-40"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: t.color }}
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p
                  className="mb-6 leading-relaxed flex-1"
                  style={{ fontSize: fluid.body, color: '#94A3B8' }}
                >
                  {t.quote}
                </p>
                <div>
                  <p
                    className="font-semibold text-[#E2E8F0]"
                    style={{ fontSize: fluid.small }}
                  >
                    {t.author}
                  </p>
                  <p style={{ fontSize: fluid.small, color: t.color }}>{t.company}</p>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Architecture() {
  const t = await getTranslations('home.architecture');

  return (
    <section className="py-24 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <h2
              className="font-bold text-[#E2E8F0] mb-6"
              style={{ fontSize: fluid.h2, lineHeight: 1.2, letterSpacing: '-0.01em' }}
            >
              {t('title', { accent: t('titleAccent') })}
            </h2>
            <p className="mb-6" style={{ fontSize: fluid.body, color: '#94A3B8', lineHeight: 1.6 }}>
              {t('description')}
            </p>
            <ul className="space-y-3">
              {[
                t('marketingSite'),
                t('productStudio'),
                t('corePackages'),
                t('workerServices'),
                t('externalBoundaries'),
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3"
                  style={{ fontSize: fluid.small, color: '#94A3B8' }}
                >
                  <span className="text-[#1565C0] mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 mt-8 text-[#1565C0] hover:text-[#6191D3] transition-colors"
              style={{ fontSize: fluid.body }}
            >
              {t('viewFull')}
              <span>→</span>
            </Link>
          </div>

          <div className="lg:col-span-7">
            <ArchitectureDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

async function IntegrationLogos() {
  const t = await getTranslations('home.integrations');

  return (
    <section className="py-24 bg-[#0D2137]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <h2
            className="font-bold text-[#E2E8F0] mb-4"
            style={{ fontSize: fluid.h2, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {t('title', { accent: t('titleAccent') })}
          </h2>
          <p style={{ fontSize: fluid.body, color: '#94A3B8', lineHeight: 1.6 }}>
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {integrationLogos.map((logo, idx) => (
            <LiquidGlassCard
              key={logo.name}
              glassIntensity="light"
              enableNoise
              springConfig="snappy"
              className={idx === 0 || idx === 5 ? 'md:col-span-2' : ''}
            >
              <Link
                href="/integrations"
                className="flex flex-col items-center justify-center gap-2 p-6 text-center h-full"
              >
                <span
                  className="text-2xl font-bold"
                  style={{ color: logo.color }}
                >
                  {logo.name}
                </span>
                <span
                  className="uppercase tracking-wider"
                  style={{ fontSize: fluid.small, color: '#64748B' }}
                >
                  {logo.category}
                </span>
              </Link>
            </LiquidGlassCard>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 text-[#1565C0] hover:text-[#6191D3] transition-colors"
            style={{ fontSize: fluid.body }}
          >
            {t('viewAll')}
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

async function HowItWorks() {
  const t = await getTranslations('home.howItWorks');

  return (
    <section id="how-it-works" className="py-24 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <h2
            className="font-bold text-[#E2E8F0] mb-4"
            style={{ fontSize: fluid.h2, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {t('title', { accent: t('titleAccent') })}
          </h2>
          <p style={{ fontSize: fluid.body, color: '#94A3B8', lineHeight: 1.6 }}>
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step, idx) => (
            <LiquidGlassCard
              key={step.num}
              glassIntensity="light"
              enableNoise
              springConfig="smooth"
              className={idx % 5 === 0 ? 'md:col-span-2' : ''}
            >
              <div className="p-5 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="flex items-center justify-center w-8 h-8 bg-[#1565C0]/10 border border-[#1565C0]/30 text-[#1565C0] font-mono font-bold rounded-lg"
                    style={{ fontSize: fluid.small }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className="font-semibold text-[#E2E8F0] mb-2"
                  style={{ fontSize: fluid.h3 }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: fluid.small, color: '#64748B' }}>{step.desc}</p>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

async function OpenSource() {
  const t = await getTranslations('home.openSource');

  return (
    <section className="py-24 bg-[#0D2137]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2
              className="font-bold text-[#E2E8F0] mb-6"
              style={{ fontSize: fluid.h2, lineHeight: 1.2, letterSpacing: '-0.01em' }}
            >
              {t('title', { accent: t('titleAccent') })}
            </h2>
            <p
              className="mb-8 max-w-xl"
              style={{ fontSize: fluid.body, color: '#94A3B8', lineHeight: 1.6 }}
            >
              {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <a
                href="https://github.com/tudsds/raino"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 glass-elevated text-[#E2E8F0] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {t('viewOnGithub')}
              </a>
              <span
                className="px-4 py-2 bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] font-mono rounded-lg"
                style={{ fontSize: fluid.small }}
              >
                {t('mitLicense')}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-floating glass-specular glass-noise p-8 rounded-2xl">
              <div className="text-xs uppercase tracking-wider mb-4" style={{ color: '#64748B' }}>
                {t('repositoryStats')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold text-[#E2E8F0]">MIT</div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>{t('license')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#E2E8F0]">Monorepo</div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>{t('architecture')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#E2E8F0]">TypeScript</div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>{t('language')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#E2E8F0]">Next.js 15</div>
                  <div className="text-sm" style={{ color: '#94A3B8' }}>{t('framework')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <LovedByEngineers />
      <Architecture />
      <IntegrationLogos />
      <HowItWorks />
      <OpenSource />
    </main>
  );
}
