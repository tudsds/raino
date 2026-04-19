import Link from 'next/link';

const workflowSteps = [
  {
    num: 1,
    title: 'Natural Language Intake',
    description:
      'Describe your hardware in plain language. Raino parses intent, constraints, and requirements from your input.',
    icon: '💬',
    color: '#00f0ff',
  },
  {
    num: 2,
    title: 'Clarifying Questions',
    description:
      'Raino resolves ambiguities through a multi-turn question loop before proceeding to formal specs.',
    icon: '❓',
    color: '#8b5cf6',
  },
  {
    num: 3,
    title: 'Structured Specification',
    description:
      'Fuzzy intent becomes a formal, validated specification with traceability to every requirement.',
    icon: '📋',
    color: '#ff00aa',
  },
  {
    num: 4,
    title: 'Architecture Selection',
    description:
      'Your requirements are matched against a library of pre-validated architecture templates.',
    icon: '🏗️',
    color: '#00ff88',
  },
  {
    num: 5,
    title: 'Part Family Selection',
    description:
      'Candidate components are selected with sourcing data, alternates, and risk indicators.',
    icon: '🔧',
    color: '#ffaa00',
  },
  {
    num: 6,
    title: 'Document Ingestion',
    description:
      'Datasheets, errata, and application notes are fetched, parsed, chunked, and embedded.',
    icon: '📄',
    color: '#00f0ff',
  },
  {
    num: 7,
    title: 'Supplier Metadata Resolution',
    description:
      'Real supplier adapters query DigiKey, Mouser, and JLCPCB for prices, stock, and MOQs.',
    icon: '🏭',
    color: '#8b5cf6',
  },
  {
    num: 8,
    title: 'RAG-Assisted Reasoning',
    description:
      'Engineering knowledge is retrieved from documents to inform component and design decisions.',
    icon: '🧠',
    color: '#ff00aa',
  },
  {
    num: 9,
    title: 'BOM Generation',
    description:
      'A full KiCad-ready bill of materials is generated with alternates and confidence scoring.',
    icon: '📦',
    color: '#00ff88',
  },
  {
    num: 10,
    title: 'KiCad Project Generation',
    description:
      'Production-ready schematic and PCB files are generated from the approved architecture.',
    icon: '⚡',
    color: '#ffaa00',
  },
  {
    num: 11,
    title: 'Preview & Download',
    description:
      'Interactive previews, manufacturing bundles, and downloadable artifacts are produced.',
    icon: '👁️',
    color: '#00f0ff',
  },
  {
    num: 12,
    title: 'Quote & Handoff',
    description:
      'Receive a rough quote with confidence bands and optionally request a PCBA handoff.',
    icon: '🚀',
    color: '#8b5cf6',
  },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
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
            <Link href="/workflow" className="text-[#00f0ff]">
              Workflow
            </Link>
            <Link href="/docs" className="text-[#a1a1aa] hover:text-[#00f0ff] transition-colors">
              Docs
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
            href={process.env.NEXT_PUBLIC_APP_URL}
            className="px-4 py-2 bg-[#111118] border-2 border-[#00f0ff] text-[#00f0ff] hover:neon-glow transition-all duration-300 font-medium"
          >
            Launch Studio
          </a>
        </div>
      </div>
    </nav>
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
            <Link href="/architecture" className="hover:text-[#00f0ff] transition-colors">
              Architecture
            </Link>
            <Link href="/workflow" className="text-[#00f0ff]">
              Workflow
            </Link>
            <Link href="/docs" className="hover:text-[#00f0ff] transition-colors">
              Docs
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

function StepNode({
  step,
  isLast,
  align,
}: {
  step: (typeof workflowSteps)[0];
  isLast: boolean;
  align: 'left' | 'right';
}) {
  return (
    <div className="relative flex items-center justify-center">
      <div className={`hidden lg:block w-5/12 ${align === 'right' ? 'order-1' : 'order-3'}`}>
        <div
          className={`p-6 bg-[#111118] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300 ${align === 'right' ? 'ml-auto' : 'mr-auto'}`}
          style={{ borderColor: `${step.color}40`, maxWidth: '20rem' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{step.icon}</span>
            <span
              className="flex items-center justify-center w-7 h-7 border-2 font-mono font-bold text-sm"
              style={{ borderColor: `${step.color}60`, color: step.color }}
            >
              {step.num}
            </span>
          </div>
          <h3
            className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-2"
            style={{ color: step.color }}
          >
            {step.title}
          </h3>
          <p className="text-sm text-[#a1a1aa]">{step.description}</p>
        </div>
      </div>

      <div className="hidden lg:flex order-2 w-2/12 flex-col items-center">
        <div className="w-4 h-4 rotate-45" style={{ backgroundColor: step.color }} />
        {!isLast && (
          <div
            className="w-px flex-1 min-h-[3rem]"
            style={{
              background: `linear-gradient(to bottom, ${step.color}, ${workflowSteps[step.num]?.color ?? '#27272a'})`,
            }}
          />
        )}
      </div>

      <div className={`hidden lg:block w-5/12 ${align === 'right' ? 'order-3' : 'order-1'}`} />

      <div className="lg:hidden w-full">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rotate-45 shrink-0" style={{ backgroundColor: step.color }} />
            {!isLast && (
              <div
                className="w-px flex-1 min-h-[2rem] mt-2"
                style={{
                  background: `linear-gradient(to bottom, ${step.color}, ${workflowSteps[step.num]?.color ?? '#27272a'})`,
                }}
              />
            )}
          </div>
          <div
            className="flex-1 p-5 bg-[#111118] border-2 border-[#27272a] hover:border-opacity-50 transition-all duration-300 mb-6"
            style={{ borderColor: `${step.color}40` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{step.icon}</span>
              <span
                className="flex items-center justify-center w-7 h-7 border-2 font-mono font-bold text-sm"
                style={{ borderColor: `${step.color}60`, color: step.color }}
              >
                {step.num}
              </span>
            </div>
            <h3
              className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-2"
              style={{ color: step.color }}
            >
              {step.title}
            </h3>
            <p className="text-sm text-[#a1a1aa]">{step.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-24 bg-[#0a0a0f] circuit-grid">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">
              The <span className="gradient-text">Workflow</span>
            </h1>
            <p className="text-xl text-[#a1a1aa]">
              From natural language to manufacturing handoff. Twelve structured steps with formal
              validation and full audit trails.
            </p>
          </div>
        </section>

        <section className="py-24 bg-[#111118]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-0 lg:space-y-4">
              {workflowSteps.map((step, index) => (
                <StepNode
                  key={step.num}
                  step={step}
                  isLast={index === workflowSteps.length - 1}
                  align={index % 2 === 0 ? 'left' : 'right'}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] mb-6">
              Ready to <span className="gradient-text">Try It?</span>
            </h2>
            <p className="text-[#a1a1aa] mb-10">
              Launch the Raino studio and run through the workflow with your own hardware idea.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={process.env.NEXT_PUBLIC_APP_URL}
                className="px-8 py-4 bg-[#00f0ff] text-[#0a0a0f] font-semibold hover:neon-glow transition-all duration-300"
              >
                Try the Workflow
              </a>
              <Link
                href="/docs"
                className="px-8 py-4 bg-[#111118] border-2 border-[#27272a] text-[#e4e4e7] font-semibold hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all duration-300"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
