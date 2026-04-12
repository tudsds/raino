'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@raino/db/supabase/browser';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setMessage('Check your email to confirm your account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="border-2 border-[#27273a] bg-[#111118] p-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#8b5cf6] to-[#ff00aa] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-2xl font-[family-name:var(--font-heading)]">
                R
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-base text-[#e4e4e7] mb-2">
              Create Account
            </h1>
            <p className="text-[#a1a1aa] text-base font-[family-name:var(--font-body)]">
              Sign up to start designing PCBs
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block font-[family-name:var(--font-heading)] text-xs text-[#a1a1aa] mb-2"
              >
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-cyber w-full px-4 py-3 text-lg font-[family-name:var(--font-body)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-[family-name:var(--font-heading)] text-xs text-[#a1a1aa] mb-2"
              >
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="input-cyber w-full px-4 py-3 text-lg font-[family-name:var(--font-body)]"
              />
            </div>

            {error && (
              <div className="border-2 border-[#ff3366] bg-[rgba(255,51,102,0.1)] px-4 py-3 text-[#ff3366] font-[family-name:var(--font-body)]">
                {error}
              </div>
            )}

            {message && (
              <div className="border-2 border-[#00ff88] bg-[rgba(0,255,136,0.1)] px-4 py-3 text-[#00ff88] font-[family-name:var(--font-body)]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-neon w-full px-6 py-3 text-[#00f0ff] font-[family-name:var(--font-body)] text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-[#27273a] text-center">
            <p className="text-[#a1a1aa] font-[family-name:var(--font-body)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00f0ff] hover:text-[#00c0cc] transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
