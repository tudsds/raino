'use client';

import { useState, use } from 'react';

interface ValidatePageClientProps {
 params: Promise<{ id: string }>;
 isDesignComplete: boolean;
 initialValidation: {
 status: string;
 result: Record<string, unknown> | null;
 } | null;
}

export default function ValidatePageClient({ params, isDesignComplete, initialValidation }: ValidatePageClientProps) {
 const { id } = use(params);
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
 const [validationStatus, setValidationStatus] = useState<string | null>(initialValidation?.status ?? null);

 const handleValidate = async () => {
 setLoading(true);
 setMessage(null);
 try {
 const res = await fetch(`/api/projects/${id}/validate`, { method: 'POST' });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error(data.error || 'Failed to run validation');
 }
 const data = await res.json();
 setMessage({ type: 'success', text: `Validation queued. ERC: ${data.validation?.erc?.pass ? 'PASS' : 'PENDING'}, DRC: ${data.validation?.drc?.pass ? 'PASS' : 'PENDING'}` });
 setValidationStatus('completed');
 setTimeout(() => window.location.reload(), 1500);
 } catch (err) {
 setMessage({
 type: 'error',
 text: err instanceof Error ? err.message : 'Failed to run validation',
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="flex flex-col items-center gap-6">
 <div className="flex items-center gap-4">
 {!validationStatus || validationStatus === 'none' ? (
 <button
 onClick={handleValidate}
 disabled={loading || !isDesignComplete}
 className="bg-[#1565C0] text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-[#1976D2] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Running Validation...' : 'Run ERC/DRC Validation'}
 </button>
 ) : (
 <button
 onClick={handleValidate}
 disabled={loading}
 className="border border-white/[0.12] text-[#94A3B8] px-4 py-2 text-sm rounded-lg hover:border-[#1565C0] hover:text-[#1565C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Re-running...' : 'Re-run Validation'}
 </button>
 )}
 </div>

 {!isDesignComplete && (
 <p className="text-sm text-[#EF5350]">
 Design must be generated before validation. Go to the Design step first.
 </p>
 )}

 {validationStatus && validationStatus !== 'none' && (
 <div className="flex items-center gap-3">
 <div className={`w-3 h-3 rounded-full ${validationStatus === 'completed' ? 'bg-[#4CAF50]' : validationStatus === 'failed' ? 'bg-[#EF5350]' : 'bg-[#FF9800]'}`} />
 <span className="text-sm text-[#94A3B8] capitalize">{validationStatus}</span>
 </div>
 )}

 {message && (
 <div
 className={`px-4 py-2 text-sm font-[family-name:var(--font-body)] border rounded-lg ${
 message.type === 'success'
 ? 'border-[#4CAF50]/30 text-[#4CAF50] bg-[#4CAF50]/10'
 : 'border-[#EF5350]/30 text-[#EF5350] bg-[#EF5350]/10'
 }`}
 >
 {message.text}
 </div>
 )}
 </div>
 );
}
