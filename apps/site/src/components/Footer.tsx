import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 bg-[#0A1929]/90 backdrop-blur-xl border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-[#E2E8F0]">
              RA<span className="text-[#1565C0]">I</span>NO
            </span>
            <p className="mt-4 text-[#64748B] max-w-sm">
              Agentic PCB & PCBA workflow platform. Constrained, auditable, source-traceable
              hardware design.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#E2E8F0] mb-4">Product</h4>
            <ul className="space-y-2 text-[#64748B]">
              <li>
                <Link href="/features" className="hover:text-[#6191D3] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="hover:text-[#6191D3] transition-colors">
                  Showcase
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-[#6191D3] transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-[#6191D3] transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/workflow" className="hover:text-[#6191D3] transition-colors">
                  Workflow
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-[#6191D3] transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_APP_URL}
                  className="hover:text-[#6191D3] transition-colors"
                >
                  Studio
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#E2E8F0] mb-4">Resources</h4>
            <ul className="space-y-2 text-[#64748B]">
              <li>
                <Link href="/trust" className="hover:text-[#6191D3] transition-colors">
                  Trust & Security
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-[#6191D3] transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/tudsds/raino"
                  className="hover:text-[#6191D3] transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tudsds/raino/blob/main/README.md"
                  className="hover:text-[#6191D3] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tudsds/raino/issues"
                  className="hover:text-[#6191D3] transition-colors"
                >
                  Issues
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#64748B] text-sm">&copy; 2024-2026 Raino. MIT Licensed.</p>
          <p className="text-[#64748B] text-sm">
            KiCad is a trademark of the KiCad Project. Not affiliated.
          </p>
        </div>
      </div>
    </footer>
  );
}
