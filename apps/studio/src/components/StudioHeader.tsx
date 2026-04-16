import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import UserMenu from '@/components/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function StudioHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b-2 border-[#27273a] bg-[#0a0a0f]/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-xl font-[family-name:var(--font-heading)]">
                R
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Raino Studio</h1>
              <p className="text-xs text-[#a1a1aa]">Agentic PCB Design Platform</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#e4e4e7] hover:text-[#00f0ff] transition-colors">
            Dashboard
          </Link>
          <LanguageSwitcher />
          {user ? (
            <UserMenu email={user.email ?? 'User'} />
          ) : (
            <Link
              href="/login"
              className="border-2 border-[#00f0ff] text-[#00f0ff] px-4 py-2 font-[family-name:var(--font-body)] text-base hover:bg-[#00f0ff] hover:text-[#0a0a0f] transition-all duration-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
