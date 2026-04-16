import Link from 'next/link';

interface LanguageSwitcherProps {
  activePath?: string;
}

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

export default function LanguageSwitcher({ activePath = '/' }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2 font-[family-name:var(--font-body)] text-lg">
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
  );
}
