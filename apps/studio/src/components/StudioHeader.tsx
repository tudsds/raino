import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import UserMenu from '@/components/UserMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function StudioHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-white/[0.12] bg-[#0A1929]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1565C0] to-[#6191D3] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl font-[family-name:var(--font-heading)]">
                R
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1565C0] to-[#6191D3]">Raino Studio</h1>
              <p className="text-xs text-[#94A3B8]">Agentic PCB Design Platform</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#E2E8F0] hover:text-[#1565C0] transition-colors duration-300">
            Dashboard
          </Link>
          <LanguageSwitcher />
          {user ? (
            <UserMenu email={user.email ?? 'User'} />
          ) : (
            <Link
              href="/login"
              className="border border-[#1565C0] text-[#1565C0] px-4 py-2 font-[family-name:var(--font-body)] text-base hover:bg-[#1565C0] hover:text-white transition-all duration-300 rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
