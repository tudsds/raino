import Link from 'next/link';

interface NavbarProps {
  activePath: string;
}

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

export default function Navbar({ activePath }: NavbarProps) {
  const studioUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  const linkClass = (path: string) =>
    activePath === path
      ? 'text-[#00f0ff]'
      : 'text-[#a1a1aa] hover:text-[#00f0ff] transition-colors';

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
            <Link href="/" className={linkClass('/')}>
              Home
            </Link>
            <Link href="/features" className={linkClass('/features')}>
              Features
            </Link>
            <Link href="/architecture" className={linkClass('/architecture')}>
              Architecture
            </Link>
            <Link
              href="/#how-it-works"
              className={
                activePath === '/'
                  ? 'text-[#00f0ff]'
                  : 'text-[#a1a1aa] hover:text-[#00f0ff] transition-colors'
              }
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
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 font-[family-name:var(--font-body)] text-lg">
              {languages.map((lang, idx) => (
                <span key={lang.code} className="flex items-center gap-2">
                  <Link
                    href={activePath}
                    className={
                      lang.code === 'en'
                        ? 'text-[#00f0ff]'
                        : 'text-[#71717a] hover:text-[#00f0ff] transition-colors'
                    }
                  >
                    {lang.label}
                  </Link>
                  {idx < languages.length - 1 && <span className="text-[#71717a]">|</span>}
                </span>
              ))}
            </div>
            <a
              href={studioUrl}
              className="px-4 py-2 bg-[#111118] border-2 border-[#00f0ff] text-[#00f0ff] hover:neon-glow transition-all duration-300 font-medium"
            >
              Launch Studio
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
