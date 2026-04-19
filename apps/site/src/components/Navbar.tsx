'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  activePath?: string;
}

const languages = [
  { code: 'en', label: 'EN', href: '/' },
  { code: 'zh', label: '中文', href: 'https://github.com/tudsds/raino/blob/main/README.zh-CN.md' },
  { code: 'ja', label: '日本語', href: 'https://github.com/tudsds/raino/blob/main/README.ja.md' },
  { code: 'ko', label: '한국어', href: 'https://github.com/tudsds/raino/blob/main/README.ko.md' },
];

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'Workflow', href: '/workflow' },
  { label: 'Docs', href: '/docs' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Trust', href: '/trust' },
];

export default function Navbar({ activePath }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const studioUrl = process.env.NEXT_PUBLIC_APP_URL;

  const linkClass = (path: string) =>
    activePath === path
      ? 'text-[#00f0ff]'
      : 'text-[#a1a1aa] hover:text-[#00f0ff] transition-colors';

  const mobileLinkClass = (path: string) =>
    activePath === path
      ? 'block px-4 py-3 text-[#00f0ff] bg-[#00f0ff]/10'
      : 'block px-4 py-3 text-[#a1a1aa] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
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
                  {lang.code === 'en' ? (
                    <Link href={lang.href} className="text-[#00f0ff]">
                      {lang.label}
                    </Link>
                  ) : (
                    <a
                      href={lang.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#71717a] hover:text-[#00f0ff] transition-colors"
                    >
                      {lang.label}
                    </a>
                  )}
                  {idx < languages.length - 1 && <span className="text-[#71717a]">|</span>}
                </span>
              ))}
            </div>
            <a
              href={studioUrl}
              className="hidden sm:inline-block px-4 py-2 bg-[#111118] border-2 border-[#00f0ff] text-[#00f0ff] hover:neon-glow transition-all duration-300 font-medium"
            >
              Launch Studio
            </a>
            <button
              className="md:hidden p-2 text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-16 left-0 right-0 bg-[#0a0a0f]/95 border-b border-[#27272a] backdrop-blur-sm"
        >
          <div className="px-4 py-2 space-y-1 font-[family-name:var(--font-body)] text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass(link.href)}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/tudsds/raino"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-[#a1a1aa] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              GitHub
            </a>
            <a
              href={studioUrl}
              className="block px-4 py-3 text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Launch Studio
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
