'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NeonButton from '@/components/NeonButton';

export default function NewProjectPage() {
 const router = useRouter();
 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 const res = await fetch('/api/projects', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ name, description }),
 });

 const data = await res.json();

 if (!res.ok) {
 setError(data.error ?? 'Failed to create project');
 return;
 }

 router.push(`/projects/${data.project.id}`);
 } catch {
 setError('An unexpected error occurred');
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="min-h-screen bg-[#0A1929]">
 <header className="border-b border-[#1E3A5F] bg-[#0A1929]/80 sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
 <Link href="/" className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M10 19l-7-7m0 0l7-7m-7 7h18"
 />
 </svg>
 </Link>
 <h1 className="text-xl font-bold text-[#E2E8F0] font-[family-name:var(--font-heading)]">
 New Project
 </h1>
 </div>
 </header>

 <main className="max-w-7xl mx-auto px-6 py-8">
 <div className="max-w-2xl mx-auto">
 <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl p-8">
 <h2 className="text-2xl font-bold text-[#E2E8F0] mb-6 font-[family-name:var(--font-heading)]">
 Create a new project
 </h2>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label
 htmlFor="name"
 className="block font-[family-name:var(--font-heading)] text-[#94A3B8] mb-2 uppercase tracking-wider"
 style={{ fontSize: '0.6rem' }}
 >
 Project Name
 </label>
 <input
 id="name"
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 maxLength={200}
 placeholder="Enter project name"
 className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-3 text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#1565C0]/50 w-full px-3 py-2 font-[family-name:var(--font-body)] text-lg"
 />
 </div>

 <div>
 <label
 htmlFor="description"
 className="block font-[family-name:var(--font-heading)] text-[#94A3B8] mb-2 uppercase tracking-wider"
 style={{ fontSize: '0.6rem' }}
 >
 Description
 </label>
 <textarea
 id="description"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 maxLength={2000}
 placeholder="Describe your hardware idea..."
 rows={5}
 className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-3 text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#1565C0]/50 w-full px-3 py-2 font-[family-name:var(--font-body)] text-lg resize-y min-h-[120px]"
 />
 </div>

 {error && (
 <div className="bg-[#EF5350]/10 border-2 border-[#EF5350] px-4 py-3">
 <p className="text-[#EF5350]">{error}</p>
 </div>
 )}

 <div className="flex items-center gap-4 pt-2">
 <NeonButton disabled={loading}>
 {loading ? 'Creating...' : 'Create Project'}
 </NeonButton>
 <Link
 href="/"
 className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors font-[family-name:var(--font-body)] text-lg"
 >
 Cancel
 </Link>
 </div>
 </form>
 </div>
 </div>
 </main>
 </div>
 );
}
