import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 bg-[#0a0a0f] border-t border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              RA<span className="text-[#00f0ff]">I</span>NO
            </span>
            <p className="mt-4 text-[#71717a] max-w-sm">
              Agentic PCB & PCBA workflow platform. Constrained, auditable, source-traceable
              hardware design.
            </p>
          </div>
          <div>
            <h4 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Product</h4>
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
                <Link href="/workflow" className="hover:text-[#00f0ff] transition-colors">
                  Workflow
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-[#00f0ff] transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_APP_URL}
                  className="hover:text-[#00f0ff] transition-colors"
                >
                  Studio
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Resources</h4>
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
          <p className="text-[#71717a] text-sm">&copy; 2024-2026 Raino. MIT Licensed.</p>
          <p className="text-[#71717a] text-sm">
            KiCad is a trademark of the KiCad Project. Not affiliated.
          </p>
        </div>
      </div>
    </footer>
  );
}
