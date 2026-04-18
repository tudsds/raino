import Link from 'next/link';

interface LanguageSwitcherProps {
  activePath?: string;
}

const languages = [
  { code: 'en', label: 'EN', href: '/' },
  { code: 'zh', label: '中文', href: 'https://github.com/tudsds/raino/blob/main/README.zh-CN.md' },
  { code: 'ja', label: '日本語', href: 'https://github.com/tudsds/raino/blob/main/README.ja.md' },
  { code: 'ko', label: '한국어', href: 'https://github.com/tudsds/raino/blob/main/README.ko.md' },
];

export default function LanguageSwitcher(_props: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2 font-[family-name:var(--font-body)] text-lg">
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
  );
}
