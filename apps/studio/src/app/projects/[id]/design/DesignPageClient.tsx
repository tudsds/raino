'use client';

import { useState, use, useEffect } from 'react';

interface DesignPageClientProps {
 params: Promise<{ id: string }>;
 hasBOM: boolean;
 initialJobStatus: string | null;
}

export default function DesignPageClient({ params, hasBOM, initialJobStatus }: DesignPageClientProps) {
 const { id } = use(params);
 const [loading, setLoading] = useState(false);
 const [polling, setPolling] = useState(false);
 const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
 const [jobStatus, setJobStatus] = useState<string | null>(initialJobStatus);

 const handleGenerate = async () => {
 setLoading(true);
 setMessage(null);
 try {
 const res = await fetch(`/api/projects/${id}/design`, { method: 'POST' });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error(data.error || 'Failed to queue design job');
 }
 const data = await res.json();
 if (data.warning) {
 setMessage({ type: 'warning', text: data.warning });
 } else {
 setMessage({ type: 'success', text: 'Design job queued. Monitoring progress...' });
 }
 setJobStatus('pending');
 setPolling(true);
 } catch (err) {
 setMessage({
 type: 'error',
 text: err instanceof Error ? err.message : 'Failed to queue design job',
 });
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (!polling || !jobStatus) return;
 if (jobStatus === 'completed' || jobStatus === 'failed') {
 setPolling(false);
 if (jobStatus === 'completed') {
 setMessage({ type: 'success', text: 'Design generation completed successfully!' });
 setTimeout(() => window.location.reload(), 1500);
 } else {
 setMessage({ type: 'error', text: 'Design generation failed. Check job details below.' });
 }
 return;
 }

 const interval = setInterval(async () => {
 try {
 const res = await fetch(`/api/projects/${id}/design/status`);
 if (!res.ok) return;
 const data = await res.json();
 setJobStatus(data.status);
 if (data.status === 'completed' || data.status === 'failed') {
 setPolling(false);
 if (data.status === 'completed') {
 setMessage({ type: 'success', text: 'Design generation completed successfully!' });
 setTimeout(() => window.location.reload(), 1500);
 } else {
 setMessage({ type: 'error', text: data.error || 'Design generation failed.' });
 }
 }
 } catch {
 void 0;
 }
 }, 3000);

 return () => clearInterval(interval);
 }, [polling, jobStatus, id]);

 const statusColor = () => {
 switch (jobStatus) {
 case 'completed': return 'text-[#4CAF50]';
 case 'running': return 'text-[#6191D3]';
 case 'pending': return 'text-[#FF9800]';
 case 'failed': return 'text-[#EF5350]';
 default: return 'text-[#64748B]';
 }
 };

 return (
 <div className="flex flex-col items-center gap-6">
 <div className="flex items-center gap-4">
 {!jobStatus || jobStatus === 'none' ? (
 <button
 onClick={handleGenerate}
 disabled={loading || !hasBOM}
 className="bg-[#1565C0] text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-[#1976D2] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Queuing Design Job...' : 'Generate Design'}
 </button>
 ) : (
 <button
 onClick={handleGenerate}
 disabled={loading}
 className="border border-white/[0.12] text-[#94A3B8] px-4 py-2 text-sm rounded-lg hover:border-[#1565C0] hover:text-[#1565C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Re-queuing...' : 'Re-generate Design'}
 </button>
 )}
 </div>

 {!hasBOM && (
 <p className="text-sm text-[#EF5350]">
 BOM must be generated before design. Go to the BOM step first.
 </p>
 )}

 {jobStatus && jobStatus !== 'none' && (
 <div className="flex items-center gap-2">
 <span className="text-sm text-[#64748B]">Status:</span>
 <span className={`text-sm font-medium capitalize ${statusColor()}`}>
 {jobStatus === 'running' ? (
 <span className="flex items-center gap-2">
 <span className="inline-block w-2 h-2 rounded-full bg-[#6191D3] animate-pulse" />
 Running
 </span>
 ) : jobStatus}
 </span>
 </div>
 )}

 {message && (
 <div
 className={`px-4 py-2 text-sm font-[family-name:var(--font-body)] border rounded-lg ${
 message.type === 'success'
 ? 'border-[#4CAF50]/30 text-[#4CAF50] bg-[#4CAF50]/10'
 : message.type === 'warning'
 ? 'border-[#FF9800]/30 text-[#FF9800] bg-[#FF9800]/10'
 : 'border-[#EF5350]/30 text-[#EF5350] bg-[#EF5350]/10'
 }`}
 >
 {message.text}
 </div>
 )}
 </div>
 );
}
