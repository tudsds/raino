'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { logout } from '@/lib/auth/logout';

interface UserMenuProps {
  email: string;
}

export default function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border border-white/[0.12] bg-white/[0.06] hover:border-[#1565C0] transition-all duration-300 rounded-xl"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-[#1565C0] to-[#6191D3] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">{email.charAt(0).toUpperCase()}</span>
        </div>
        <span className="text-[#E2E8F0] font-[family-name:var(--font-body)] text-base max-w-[160px] truncate">
          {email}
        </span>
        <svg
          className={`w-4 h-4 text-[#94A3B8] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-full min-w-[200px] border border-white/[0.12] bg-[#0D2137]/95 backdrop-blur-xl z-50 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.20)]">
          <div className="px-4 py-3 border-b border-white/[0.12]">
            <p className="text-[#94A3B8] text-sm font-[family-name:var(--font-body)] truncate">
              {email}
            </p>
          </div>
          <div className="p-2 space-y-1">
            <Link
              href="/settings"
              className="block w-full text-left px-4 py-2 text-[#E2E8F0] hover:bg-[rgba(21,101,192,0.1)] font-[family-name:var(--font-body)] text-base transition-colors duration-300 rounded-lg"
            >
              Settings
            </Link>
            <button
              onClick={() => logout()}
              className="w-full text-left px-4 py-2 text-[#EF5350] hover:bg-[rgba(239,83,80,0.1)] font-[family-name:var(--font-body)] text-base transition-colors duration-300 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
