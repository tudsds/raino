'use client';

import { useState, useRef, useEffect } from 'react';
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
        className="flex items-center gap-2 px-3 py-2 border-2 border-[#27273a] bg-[#1a1a24] hover:border-[#00f0ff] transition-all duration-100"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
          <span className="text-[#0a0a0f] text-xs font-bold">{email.charAt(0).toUpperCase()}</span>
        </div>
        <span className="text-[#e4e4e7] font-[family-name:var(--font-body)] text-base max-w-[160px] truncate">
          {email}
        </span>
        <svg
          className={`w-4 h-4 text-[#a1a1aa] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-full min-w-[200px] border-2 border-[#27273a] bg-[#111118] z-50 animate-slide-up">
          <div className="px-4 py-3 border-b-2 border-[#27273a]">
            <p className="text-[#a1a1aa] text-sm font-[family-name:var(--font-body)] truncate">
              {email}
            </p>
          </div>
          <div className="p-2">
            <button
              onClick={() => logout()}
              className="w-full text-left px-4 py-2 text-[#ff3366] hover:bg-[rgba(255,51,102,0.1)] font-[family-name:var(--font-body)] text-base transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
