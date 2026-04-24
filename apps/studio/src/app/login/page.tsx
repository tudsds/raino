'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@raino/db/supabase/browser';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const [paramError] = useState<string | null>(
    errorParam === 'auth_exchange_failed'
      ? 'Login link expired or invalid. Please try again.'
      : errorParam === 'provision_failed' || errorParam === 'provisioning_failed'
        ? 'Account setup failed. Please try signing up again.'
        : null,
  );

  const displayError = error || paramError;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setMessage('Check your email for the login link');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="border-2 border-[#27273a] bg-[#111118] p-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-2xl font-[family-name:var(--font-heading)]">
                R
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-base text-[#e4e4e7] mb-2">
              Sign In
            </h1>
            <p className="text-[#a1a1aa] text-base font-[family-name:var(--font-body)]">
              Enter your email to receive a magic link
            </p>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-6">
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

            {displayError && (
              <div className="border-2 border-[#ff3366] bg-[rgba(255,51,102,0.1)] px-4 py-3 text-[#ff3366] font-[family-name:var(--font-body)]">
                {displayError}
              </div>
            )}

            {message && (
              <div className="border-2 border-[#00ff88] bg-[rgba(0,255,136,0.1)] px-4 py-3 text-[#00ff88] font-[family-name:var(--font-body)]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-neon w-full px-6 py-3 text-[#00f0ff] font-[family-name:var(--font-body)] text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-[#27273a] text-center">
            <p className="text-[#a1a1aa] font-[family-name:var(--font-body)]">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-[#00f0ff] hover:text-[#00c0cc] transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
