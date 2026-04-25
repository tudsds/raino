'use client';

import { useState, use } from 'react';

interface ArchitecturePageClientProps {
 params: Promise<{ id: string }>;
 hasArchitecture: boolean;
}

export default function ArchitecturePageClient({ params, hasArchitecture }: ArchitecturePageClientProps) {
 const { id } = use(params);
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

 const handleGenerate = async () => {
 setLoading(true);
 setMessage(null);
 try {
 const res = await fetch(`/api/projects/${id}/architecture/plan`, { method: 'POST' });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error(data.error || 'Failed to generate architecture plan');
 }
 setMessage({ type: 'success', text: 'Architecture plan generated successfully.' });
 setTimeout(() => window.location.reload(), 1500);
 } catch (err) {
 setMessage({
 type: 'error',
 text: err instanceof Error ? err.message : 'Failed to generate architecture plan',
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="mt-6 flex flex-col items-center gap-4">
 {!hasArchitecture && (
 <button
 onClick={handleGenerate}
 disabled={loading}
 className="border border-[#1565C0] text-[#1565C0] px-6 py-2.5 text-sm font-medium hover:bg-[#1565C0] hover:text-[#0A1929] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Generating Architecture...' : 'Generate Architecture Plan'}
 </button>
 )}
 {hasArchitecture && (
 <button
 onClick={handleGenerate}
 disabled={loading}
 className="border border-[#2A4A6B] text-[#94A3B8] px-4 py-2 text-sm hover:border-[#1565C0] hover:text-[#1565C0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Regenerating...' : 'Regenerate Architecture'}
 </button>
 )}
 {message && (
 <div
 className={`px-4 py-2 text-sm font-[family-name:var(--font-body)] border ${
 message.type === 'success'
 ? 'border-[#4CAF50] text-[#4CAF50] bg-[rgba(76,175,80,0.13)]'
 : 'border-[#ff4444] text-[#ff4444] bg-[rgba(239,83,80,0.13)]'
 }`}
 >
 {message.text}
 </div>
 )}
 </div>
 );
}
