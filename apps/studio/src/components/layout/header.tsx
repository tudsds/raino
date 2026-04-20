import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  return (
    <header className="border-b-2 border-[#27273a] bg-[#0a0a0f]/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6]">
                Raino Studio
              </h1>
              <p className="text-xs text-[#a1a1aa]">Agentic PCB Design Platform</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#e4e4e7] hover:text-[#00f0ff] transition-colors text-sm">
            Dashboard
          </Link>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-[#a1a1aa] text-sm">{session.user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="border border-[#27273a] text-[#a1a1aa] px-3 py-1.5 text-sm hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="border-2 border-[#00f0ff] text-[#00f0ff] px-4 py-2 text-sm hover:bg-[#00f0ff] hover:text-[#0a0a0f] transition-all duration-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
