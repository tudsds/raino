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
 <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
 <div className="w-full max-w-md px-6">
 <div className="border-2 border-[#1E3A5F] bg-[#0D2137] p-8">
 <div className="mb-8 text-center">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#1565C0] to-[#6191D3] flex items-center justify-center">
 <span className="text-[#0A1929] font-bold text-2xl font-[family-name:var(--font-heading)]">
 R
 </span>
 </div>
 <h1 className="font-[family-name:var(--font-heading)] text-base text-[#E2E8F0] mb-2">
 Sign In
 </h1>
 <p className="text-[#94A3B8] text-base font-[family-name:var(--font-body)]">
 Enter your email to receive a magic link
 </p>
 </div>

 <form onSubmit={handleMagicLink} className="space-y-6">
 <div>
 <label
 htmlFor="email"
 className="block font-[family-name:var(--font-heading)] text-xs text-[#94A3B8] mb-2"
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
 className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-3 text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#1565C0]/50 w-full px-4 py-3 text-lg font-[family-name:var(--font-body)]"
 />
 </div>

 {displayError && (
 <div className="border-2 border-[#EF5350] bg-[rgba(239, 83, 80,0.1)] px-4 py-3 text-[#EF5350] font-[family-name:var(--font-body)]">
 {displayError}
 </div>
 )}

 {message && (
 <div className="border-2 border-[#4CAF50] bg-[rgba(76, 175, 80,0.1)] px-4 py-3 text-[#4CAF50] font-[family-name:var(--font-body)]">
 {message}
 </div>
 )}

 <button
 type="submit"
 disabled={loading || !email}
 className="bg-[#1565C0] text-white rounded-lg hover:bg-[#1976D2] transition-all duration-300 w-full px-6 py-3 text-[#1565C0] font-[family-name:var(--font-body)] text-lg disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Sending...' : 'Send Magic Link'}
 </button>
 </form>

 <div className="mt-8 pt-6 border-t-2 border-[#1E3A5F] text-center">
 <p className="text-[#94A3B8] font-[family-name:var(--font-body)]">
 Don&apos;t have an account?{' '}
 <Link
 href="/signup"
 className="text-[#1565C0] hover:text-[#00c0cc] transition-colors"
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
