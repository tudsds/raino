import type { Metadata } from 'next';
import Link from 'next/link';

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
  },
  {
    title: 'Structured Specifications',
    description:
      'Fuzzy intent becomes precise specs. Every requirement is captured, validated, and traced through the entire workflow.',
    icon: '📋',
  },
  {
    title: 'Approved Architectures',
    description:
      'Constrained architecture selection ensures designs stay within validated templates. No unconstrained autopilot.',
    icon: '🏗️',
  },
  {
    title: 'Intelligent BOM',
    description:
      'Full bill of materials with sourcing data, alternates, and risk indicators. Every part traceable to its source.',
    icon: '📦',
  },
  {
    title: 'KiCad Generation',
    description:
      'Automated schematic and PCB generation. Raino produces production-ready KiCad projects, not suggestions.',
    icon: '⚡',
  },
  {
    title: 'Manufacturing Handoff',
    description:
      'Previews, downloads, rough quotes, and optional PCBA handoff. Everything you need to go from design to production.',
    icon: '🚀',
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
    color: '#00f0ff',
  },
  {
    quote:
      'The BOM with real alternates saved us during the 2023 chip shortage. Raino had already flagged lifecycle risks before we even ordered.',
    author: 'Hardware Engineer',
    company: 'Robotics Company',
    color: '#8b5cf6',
  },
  {
    quote:
      'I described a motor driver in a paragraph and got a KiCad project with ERC passing. The clarifying questions caught a voltage level mismatch I would have missed.',
    author: 'Founder',
    company: 'Agricultural Sensor Platform',
    color: '#00ff88',
  },
];

const integrationLogos = [
  { name: 'Kimi', category: 'LLM', color: '#00f0ff' },
  { name: 'Supabase', category: 'Database', color: '#00ff88' },
  { name: 'DigiKey', category: 'Supplier', color: '#ffaa00' },
  { name: 'Mouser', category: 'Supplier', color: '#ff6633' },
  { name: 'JLCPCB', category: 'Fabrication', color: '#ff00aa' },
  { name: 'KiCad', category: 'EDA', color: '#8b5cf6' },
];

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center circuit-grid pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111118] border-2 border-[#27272a] mb-8">
          <span className="w-2 h-2 bg-[#00ff88] animate-pulse" />
          <span className="text-sm text-[#a1a1aa]">MIT Licensed · Open Source</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-6">
          Design PCBs with <span className="gradient-text">Structured Intelligence</span>
        </h1>
        <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10">
          Raino converts fuzzy hardware intent into structured specs, selects approved
          architectures, and generates KiCad projects with full audit trails.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            className="px-8 py-4 bg-[#00f0ff] text-[#0a0a0f] font-semibold hover:neon-glow transition-all duration-300"
          >
            Get Started
          </a>
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-[#111118] border-2 border-[#27272a] text-[#e4e4e7] font-semibold hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all duration-300"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
            Everything You Need to <span className="gradient-text">Ship Hardware</span>
          </h2>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto">
            From natural language to manufacturing handoff. Raino handles the entire workflow with
            constrained agents and formal verification.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-[#111118] border-2 border-[#27272a] hover:border-[#00f0ff]/50 transition-all duration-300 hover:neon-glow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2 text-[#e4e4e7]">
                {feature.title}
              </h3>
              <p className="text-[#a1a1aa]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LovedByEngineers() {
  return (
    <section className="py-24 bg-[#111118]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
            Loved by <span className="gradient-text">Engineers</span>
          </h2>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto">
            Teams using Raino report faster iteration, fewer schematic errors, and clearer
            communication between hardware and software engineers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="p-6 bg-[#0a0a0f] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300"
              style={{ borderColor: `${t.color}40` }}
            >
              <div className="mb-6">
                <svg
                  className="w-8 h-8 opacity-30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: t.color }}
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-[#a1a1aa] mb-6 leading-relaxed">{t.quote}</p>
              <div>
                <p className="font-semibold text-[#e4e4e7] font-[family-name:var(--font-heading)] text-sm">
                  {t.author}
                </p>
                <p className="text-sm" style={{ color: t.color }}>
                  {t.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationLogos() {
  return (
    <section className="py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
            Powered By <span className="gradient-text">Best-in-Class Tools</span>
          </h2>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto">
            Raino integrates with industry-standard suppliers, databases, and design tools. Every
            connection has honest fallback modes.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrationLogos.map((logo) => (
            <Link
              key={logo.name}
              href="/integrations"
              className="group p-6 bg-[#111118] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300 text-center flex flex-col items-center justify-center gap-3"
              style={{ borderColor: `${logo.color}40` }}
            >
              <span
                className="text-2xl font-bold font-[family-name:var(--font-heading)]"
                style={{ color: logo.color }}
              >
                {logo.name}
              </span>
              <span className="text-xs text-[#71717a] font-mono uppercase tracking-wider">
                {logo.category}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 text-[#00f0ff] hover:underline"
          >
            View all integrations
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="py-24 bg-[#111118]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-6">
              System <span className="gradient-text">Architecture</span>
            </h2>
            <p className="text-[#a1a1aa] mb-6">
              Raino is built as a modular system with clear boundaries. The marketing site and
              product studio communicate with worker services through well-defined APIs.
            </p>
            <ul className="space-y-3">
              {[
                'Marketing site — Public-facing information and documentation',
                'Product studio — Design workflow application',
                'Core packages — Schemas, validation, domain logic, RAG, LLM gateway',
                'Worker services — Ingest, design, quote, audit',
                'External boundaries — Supabase, KiCad CLI, supplier APIs',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#a1a1aa]">
                  <span className="text-[#00f0ff] mt-1">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 mt-8 text-[#00f0ff] hover:underline"
            >
              View full architecture
              <span>→</span>
            </Link>
          </div>
          <div className="bg-[#0a0a0f] border-2 border-[#27272a] p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-[#a1a1aa]">
              {`┌─────────────────────────────────────────────┐
│                  Users                       │
│                                              │
│  ┌──────────┐          ┌────────────────┐    │
│  │  site    │───CTA───▶│    studio      │    │
│  │ (marketing)│        │  (product app) │    │
│  └──────────┘          └───────┬────────┘    │
│                                │             │
│  ┌─────────────────────────────┴──────────┐  │
│  │         packages/core (schemas, logic) │  │
│  ├────────┬────────┬────────┬────────────┤  │
│  │  rag   │  llm   │   db   │  agents    │  │
│  │  ui    │kicad-w-c│supplier-c│        │  │
│  └────────┴────────┴────────┴────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ingest · design · quote · audit       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌──────────┬──────────┬──────────────────┐  │
│  │ Supabase │  KiCad   │ DigiKey/Mouser   │  │
│  │(Auth+DB) │ (GPL CLI)│    /JLCPCB       │  │
│  └──────────┴──────────┴──────────────────┘  │
└─────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto">
            A 12-step workflow from natural language to manufacturing handoff. Every step has formal
            validation and audit trails.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div key={step.num} className="relative">
              <div className="p-6 bg-[#111118] border-2 border-[#27272a] h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#00f0ff]/10 border-2 border-[#00f0ff]/30 text-[#00f0ff] font-mono font-bold text-sm">
                    {step.num}
                  </span>
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-[#00f0ff]/30 to-transparent" />
                  )}
                </div>
                <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#71717a]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className="py-24 bg-[#111118]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-6">
          Open <span className="gradient-text">Source</span>
        </h2>
        <p className="text-[#a1a1aa] mb-8">
          Raino is MIT licensed. The entire codebase is available on GitHub. Contribute, fork, or
          deploy your own instance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0f] border-2 border-[#27272a] hover:border-[#00f0ff] transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          <span className="px-4 py-2 bg-[#00ff88]/10 border-2 border-[#00ff88]/30 text-[#00ff88] text-sm font-mono">
            MIT License
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
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
