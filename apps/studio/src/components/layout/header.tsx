import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10, 25, 41, 0.85)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid rgba(97, 145, 211, 0.35)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1565C0] to-[#6191D3] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1565C0] to-[#6191D3]">
                Raino Studio
              </h1>
              <p className="text-xs text-[#94A3B8]">Agentic PCB Design Platform</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#E2E8F0] hover:text-[#1565C0] transition-colors duration-300 text-sm">
            Dashboard
          </Link>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-[#94A3B8] text-sm">{session.user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="border border-white/[0.12] text-[#94A3B8] px-3 py-1.5 text-sm hover:border-[#1565C0] hover:text-[#1565C0] transition-all duration-300 rounded-lg"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="border border-[#1565C0] text-[#1565C0] px-4 py-2 text-sm hover:bg-[#1565C0] hover:text-white transition-all duration-300 rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
