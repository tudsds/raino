'use client';

import { useState, use } from 'react';

interface BOMPageClientProps {
 params: Promise<{ id: string }>;
 hasBOM: boolean;
}

export default function BOMPageClient({ params, hasBOM }: BOMPageClientProps) {
 const { id } = use(params);
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

 const handleGenerate = async () => {
 setLoading(true);
 setMessage(null);
 try {
 const res = await fetch(`/api/projects/${id}/bom/generate`, { method: 'POST' });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error(data.error || 'Failed to generate BOM');
 }
 setMessage({ type: 'success', text: 'BOM generated successfully.' });
 setTimeout(() => window.location.reload(), 1500);
 } catch (err) {
 setMessage({
 type: 'error',
 text: err instanceof Error ? err.message : 'Failed to generate BOM',
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="flex flex-col items-center gap-4">
 {!hasBOM ? (
 <button
 onClick={handleGenerate}
 disabled={loading}
 className="border border-[#1565C0] text-[#1565C0] px-6 py-2.5 text-sm font-medium hover:bg-[#1565C0] hover:text-[#0A1929] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Generating BOM...' : 'Generate BOM'}
 </button>
 ) : (
 <button
 onClick={handleGenerate}
 disabled={loading}
 className="border border-[#2A4A6B] text-[#94A3B8] px-4 py-2 text-sm hover:border-[#1565C0] hover:text-[#1565C0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Regenerating...' : 'Regenerate BOM'}
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
