import Link from 'next/link';

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
  { num: 7, title: 'BOM Generation', desc: 'Full BOM with alternates and risk indicators' },
  { num: 8, title: 'KiCad Output', desc: 'Production-ready schematic and PCB files' },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-['Space_Grotesk']">
              RA<span className="text-[#00f0ff]">I</span>NO
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/features"
              className="text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/architecture"
              className="text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
            >
              Architecture
            </Link>
            <Link
              href="#how-it-works"
              className="text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
            >
              How It Works
            </Link>
            <a
              href="https://github.com/tudsds/raino"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
            >
              GitHub
            </a>
          </div>
          <a
            href="http://localhost:3001"
            className="px-4 py-2 bg-[#111118] border border-[#00f0ff] text-[#00f0ff] rounded hover:neon-glow transition-all duration-300 font-medium"
          >
            Launch Studio
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center circuit-grid pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111118] border border-[#27272a] rounded-full mb-8">
          <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm text-[#a1a1aa]">MIT Licensed · Open Source</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-['Space_Grotesk'] leading-tight mb-6">
          Design PCBs with <span className="gradient-text">Structured Intelligence</span>
        </h1>
        <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10">
          Raino converts fuzzy hardware intent into structured specs, selects approved
          architectures, and generates KiCad projects with full audit trails.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="http://localhost:3001"
            className="px-8 py-4 bg-[#00f0ff] text-[#0a0a0f] font-semibold rounded-lg hover:neon-glow transition-all duration-300"
          >
            Get Started
          </a>
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-[#111118] border border-[#27272a] text-[#e4e4e7] font-semibold rounded-lg hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all duration-300"
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
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">
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
              className="group p-6 bg-[#111118] border border-[#27272a] rounded-xl hover:border-[#00f0ff]/50 transition-all duration-300 hover:neon-glow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold font-['Space_Grotesk'] mb-2 text-[#e4e4e7]">
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

function Architecture() {
  return (
    <section className="py-24 bg-[#111118]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-6">
              System <span className="gradient-text">Architecture</span>
            </h2>
            <p className="text-[#a1a1aa] mb-6">
              Raino is built as a modular system with clear boundaries. The marketing site and
              product studio communicate with worker services through well-defined APIs.
            </p>
            <ul className="space-y-3">
              {[
                'Marketing site (Port 3000) — Public-facing information',
                'Product studio (Port 3001) — Design workflow application',
                'Core packages — Schemas, validation, domain logic',
                'Worker services — Ingest, design, quote, audit',
                'External boundaries — KiCad CLI, supplier APIs',
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
          <div className="bg-[#0a0a0f] border border-[#27272a] rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-[#a1a1aa]">
              {`┌─────────────────────────────────────┐
│            Users                     │
│                                      │
│  ┌──────────┐    ┌──────────────┐    │
│  │  site    │───▶│   studio     │    │
│  │  :3000   │    │   :3001      │    │
│  └──────────┘    └──────┬───────┘    │
│                         │            │
│  ┌──────────────────────┴─────────┐  │
│  │        packages/core           │  │
│  │  Schemas · Validation · Logic  │  │
│  └──────┬──────────┬──────────────┘  │
│         │          │                 │
│  ┌──────┴──┐ ┌─────┴────┐ ┌────────┐│
│  │  RAG    │ │  KiCad   │ │Supplier││
│  │         │ │  Worker  │ │Clients ││
│  └─────────┘ └──────────┘ └────────┘│
└─────────────────────────────────────┘`}
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
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto">
            An 8-step workflow from natural language to manufacturing handoff. Every step has formal
            validation and audit trails.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div key={step.num} className="relative">
              <div className="p-6 bg-[#111118] border border-[#27272a] rounded-xl h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] rounded-lg font-mono font-bold text-sm">
                    {step.num}
                  </span>
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-[#00f0ff]/30 to-transparent" />
                  )}
                </div>
                <h3 className="font-semibold font-['Space_Grotesk'] mb-2">{step.title}</h3>
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
        <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-6">
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
            className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0f] border border-[#27272a] rounded-lg hover:border-[#00f0ff] transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          <span className="px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm font-mono">
            MIT License
          </span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-[#0a0a0f] border-t border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold font-['Space_Grotesk']">
              RA<span className="text-[#00f0ff]">I</span>NO
            </span>
            <p className="mt-4 text-[#71717a] max-w-sm">
              Agentic PCB & PCBA workflow platform. Constrained, auditable, source-traceable
              hardware design.
            </p>
          </div>
          <div>
            <h4 className="font-semibold font-['Space_Grotesk'] mb-4">Product</h4>
            <ul className="space-y-2 text-[#71717a]">
              <li>
                <Link href="/features" className="hover:text-[#00f0ff] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-[#00f0ff] transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <a href="http://localhost:3001" className="hover:text-[#00f0ff] transition-colors">
                  Studio
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold font-['Space_Grotesk'] mb-4">Resources</h4>
            <ul className="space-y-2 text-[#71717a]">
              <li>
                <a
                  href="https://github.com/tudsds/raino"
                  className="hover:text-[#00f0ff] transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tudsds/raino/blob/main/README.md"
                  className="hover:text-[#00f0ff] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tudsds/raino/issues"
                  className="hover:text-[#00f0ff] transition-colors"
                >
                  Issues
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#27272a] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#71717a] text-sm">© 2024 Raino. MIT Licensed.</p>
          <p className="text-[#71717a] text-sm">
            KiCad is a trademark of the KiCad Project. Not affiliated.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Architecture />
        <HowItWorks />
        <OpenSource />
      </main>
      <Footer />
    </>
  );
}
