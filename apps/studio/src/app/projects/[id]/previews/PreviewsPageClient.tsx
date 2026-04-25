'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { DegradedModeBanner } from '@/components/DegradedModeBanner';

interface PreviewResponse {
 projectId: string;
 type: string;
 format: string;
 isPlaceholder: boolean;
 available: boolean;
 artifactId?: string;
 fileName?: string;
 filePath?: string;
 fileSize?: number;
 mimeType?: string;
 checksum?: string;
 createdAt?: string;
 meta?: { mode: string; reason: string };
}

function SchematicPlaceholder() {
 return (
 <svg viewBox="0 0 800 600" className="w-full h-full">
 <rect width="800" height="600" fill="#0D2137" />
 <defs>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#132F4C" strokeWidth="1" />
 </pattern>
 </defs>
 <rect width="800" height="600" fill="url(#grid)" />
 <text x="400" y="300" textAnchor="middle" fill="#2A4A6B" fontSize="18" fontFamily="'Noto Serif', serif">
 No schematic preview available
 </text>
 <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="'Noto Serif', serif">
 Schematic Preview (Placeholder)
 </text>
 </svg>
 );
}

function PCB2DPlaceholder() {
 return (
 <svg viewBox="0 0 800 600" className="w-full h-full">
 <rect width="800" height="600" fill="#132F4C" />
 <text x="400" y="300" textAnchor="middle" fill="#2A4A6B" fontSize="18" fontFamily="'Noto Serif', serif">
 No PCB 2D preview available
 </text>
 <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="'Noto Serif', serif">
 PCB 2D Preview (Placeholder)
 </text>
 </svg>
 );
}

function PCB3DPlaceholder() {
 return (
 <svg viewBox="0 0 800 600" className="w-full h-full">
 <rect width="800" height="600" fill="#0A1929" />
 <text x="400" y="300" textAnchor="middle" fill="#2A4A6B" fontSize="18" fontFamily="'Noto Serif', serif">
 No PCB 3D preview available
 </text>
 <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="'Noto Serif', serif">
 PCB 3D Preview (Placeholder)
 </text>
 </svg>
 );
}

function PreviewError({ message }: { message: string }) {
 return (
 <svg viewBox="0 0 800 600" className="w-full h-full">
 <rect width="800" height="600" fill="#1A3A5C" />
 <text x="400" y="300" textAnchor="middle" fill="#ef4444" fontSize="18" fontFamily="'Noto Serif', serif">
 Error loading preview
 </text>
 <text x="400" y="330" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="'Noto Serif', serif">
 {message}
 </text>
 </svg>
 );
}

interface PreviewsPageClientProps {
 params: Promise<{ id: string }>;
 degradedMessage?: string;
}

export default function PreviewsPageClient({ params, degradedMessage }: PreviewsPageClientProps) {
 const { id } = use(params);
 const [activeTab, setActiveTab] = useState<'schematic' | 'pcb2d' | 'pcb3d'>('schematic');
 const [previewData, setPreviewData] = useState<Record<string, PreviewResponse | null>>({
 schematic: null,
 pcb2d: null,
 pcb3d: null,
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [designLoading, setDesignLoading] = useState(false);
 const [designMessage, setDesignMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

 const hasPlaceholder = degradedMessage || Object.values(previewData).some(
 (p) => p && (p.isPlaceholder || !p.available)
 );

 const handleGenerateDesign = async () => {
 setDesignLoading(true);
 setDesignMessage(null);
 try {
 const res = await fetch(`/api/projects/${id}/design`, { method: 'POST' });
 if (!res.ok) throw new Error('Failed to generate design');
 setDesignMessage({ type: 'success', text: 'Design generation started successfully' });
 } catch (err) {
 setDesignMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to start design generation' });
 } finally {
 setDesignLoading(false);
 }
 };

 const tabs = [
 { id: 'overview', label: 'Overview', href: `/projects/${id}` },
 { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
 { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
 { id: 'previews', label: 'Previews', href: `/projects/${id}/previews`, active: true },
 { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
 { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
 ];

 const viewTabs = [
 { id: 'schematic', label: 'Schematic' },
 { id: 'pcb2d', label: 'PCB 2D' },
 { id: 'pcb3d', label: 'PCB 3D' },
 ];

 const fetchPreview = async (type: 'schematic' | 'pcb2d' | 'pcb3d') => {
 if (previewData[type] !== null) return;
 setLoading(true);
 setError(null);
 try {
 const res = await fetch(`/api/projects/${id}/previews/${type}`);
 if (!res.ok) throw new Error('Failed to fetch');
 const data = await res.json();
 setPreviewData((prev) => ({ ...prev, [type]: data }));
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Unknown error');
 } finally {
 setLoading(false);
 }
 };

 if (activeTab === 'schematic' && previewData.schematic === null && !loading) {
 fetchPreview('schematic');
 }
 if (activeTab === 'pcb2d' && previewData.pcb2d === null && !loading) {
 fetchPreview('pcb2d');
 }
 if (activeTab === 'pcb3d' && previewData.pcb3d === null && !loading) {
 fetchPreview('pcb3d');
 }

 const currentPreview = previewData[activeTab];

 const renderPreview = () => {
 if (loading) {
 return (
 <svg viewBox="0 0 800 600" className="w-full h-full">
 <rect width="800" height="600" fill="#0A1929" />
 <text
 x="400"
 y="300"
 textAnchor="middle"
 fill="#1565C0"
 fontSize="18"
 fontFamily="'Noto Serif', serif"
 >
 Loading preview...
 </text>
 </svg>
 );
 }

 if (error) {
 return <PreviewError message={error} />;
 }

 if (!currentPreview) {
 return <SchematicPlaceholder />;
 }

 if (currentPreview.isPlaceholder || !currentPreview.available) {
 if (activeTab === 'schematic') return <SchematicPlaceholder />;
 if (activeTab === 'pcb2d') return <PCB2DPlaceholder />;
 if (activeTab === 'pcb3d') return <PCB3DPlaceholder />;
 }

 if (currentPreview.format === 'svg' && currentPreview.filePath) {
 return (
 <div className="w-full h-full flex items-center justify-center bg-[#0A1929]">
 <img
 src={currentPreview.filePath}
 alt={`${activeTab} preview`}
 className="max-w-full max-h-full object-contain"
 />
 </div>
 );
 }

 if (currentPreview.format === 'glb' && currentPreview.filePath) {
 return (
 <div className="w-full h-full flex items-center justify-center bg-[#0A1929]">
 <div className="text-center">
 <p className="text-[#1565C0] font-[family-name:var(--font-body)] mb-2">3D Preview Available</p>
 <p className="text-[#64748b] text-sm">{currentPreview.fileName}</p>
 </div>
 </div>
 );
 }

 if (activeTab === 'schematic') return <SchematicPlaceholder />;
 if (activeTab === 'pcb2d') return <PCB2DPlaceholder />;
 return <PCB3DPlaceholder />;
 };

 return (
 <div className="min-h-screen bg-[#0A1929]">
 <header className="border-b border-[#1E3A5F] bg-[#0A1929]/80 sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Link
 href={`/projects/${id}`}
 className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M10 19l-7-7m0 0l7-7m-7 7h18"
 />
 </svg>
 </Link>
 <div>
 <h1 className="text-xl font-bold text-[#E2E8F0]">Design Previews</h1>
 <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">{id}</p>
 </div>
 {hasPlaceholder && (
 <button
 onClick={handleGenerateDesign}
 disabled={designLoading}
 className="border border-[#1565C0] text-[#1565C0] px-4 py-2 text-sm hover:bg-[#1565C0] hover:text-[#0A1929] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {designLoading ? 'Generating...' : 'Generate Design'}
 </button>
 )}
 </div>
 </div>
 </header>

 <div className="border-b border-[#1E3A5F] bg-[#132F4C]/50">
 <div className="max-w-7xl mx-auto px-6">
 <nav className="flex gap-1">
 {tabs.map((tab) => (
 <Link
 key={tab.id}
 href={tab.href}
 className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
 tab.active
 ? 'text-[#1565C0] border-[#1565C0]'
 : 'text-[#94A3B8] border-transparent hover:text-[#E2E8F0] hover:border-[#2A4A6B]'
 }`}
 >
 {tab.label}
 </Link>
 ))}
 </nav>
 </div>
 </div>

 <main className="max-w-7xl mx-auto px-6 py-8">
 {degradedMessage && <DegradedModeBanner message={degradedMessage} severity="amber" />}
 {designMessage && (
 <div
 className={`mb-4 px-4 py-3 text-sm font-[family-name:var(--font-body)] border ${
 designMessage.type === 'success'
 ? 'border-[#4CAF50] text-[#4CAF50] bg-[rgba(76,175,80,0.13)]'
 : 'border-[#ff4444] text-[#ff4444] bg-[rgba(239,83,80,0.13)]'
 }`}
 >
 {designMessage.text}
 </div>
 )}
 <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl overflow-hidden">
 <div className="border-b border-[#1E3A5F] px-6 py-4">
 <div className="flex gap-6">
 {viewTabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as typeof activeTab)}
 className={`text-sm font-medium transition-all pb-2 border-b-2 ${
 activeTab === tab.id
 ? 'text-[#1565C0] border-[#1565C0]'
 : 'text-[#94A3B8] border-transparent hover:text-[#E2E8F0]'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 <div className="aspect-video bg-[#0A1929]">{renderPreview()}</div>
 </div>
 </main>
 </div>
 );
}
