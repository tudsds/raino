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
      <rect width="800" height="600" fill="#0f0f16" />
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#grid)" />
      <text x="400" y="300" textAnchor="middle" fill="#3a3a5a" fontSize="18" fontFamily="monospace">
        No schematic preview available
      </text>
      <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
        Schematic Preview (Placeholder)
      </text>
    </svg>
  );
}

function PCB2DPlaceholder() {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <rect width="800" height="600" fill="#1a1a25" />
      <text x="400" y="300" textAnchor="middle" fill="#3a3a5a" fontSize="18" fontFamily="monospace">
        No PCB 2D preview available
      </text>
      <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
        PCB 2D Preview (Placeholder)
      </text>
    </svg>
  );
}

function PCB3DPlaceholder() {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <rect width="800" height="600" fill="#0a0a0f" />
      <text x="400" y="300" textAnchor="middle" fill="#3a3a5a" fontSize="18" fontFamily="monospace">
        No PCB 3D preview available
      </text>
      <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
        PCB 3D Preview (Placeholder)
      </text>
    </svg>
  );
}

function PreviewError({ message }: { message: string }) {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <rect width="800" height="600" fill="#1a0a0a" />
      <text x="400" y="300" textAnchor="middle" fill="#ef4444" fontSize="18" fontFamily="monospace">
        Error loading preview
      </text>
      <text x="400" y="330" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
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
          <rect width="800" height="600" fill="#0a0a0f" />
          <text
            x="400"
            y="300"
            textAnchor="middle"
            fill="#00f0ff"
            fontSize="18"
            fontFamily="monospace"
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
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
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
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
          <div className="text-center">
            <p className="text-[#00f0ff] font-mono mb-2">3D Preview Available</p>
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
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${id}`}
              className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
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
              <h1 className="text-xl font-bold text-[#e4e4e7]">Design Previews</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
            {hasPlaceholder && (
              <button
                onClick={handleGenerateDesign}
                disabled={designLoading}
                className="border border-[#00f0ff] text-[#00f0ff] px-4 py-2 text-sm hover:bg-[#00f0ff] hover:text-[#0a0a0f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {designLoading ? 'Generating...' : 'Generate Design'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-[#27273a] bg-[#13131f]/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#00f0ff] border-[#00f0ff]'
                    : 'text-[#a1a1aa] border-transparent hover:text-[#e4e4e7] hover:border-[#3a3a5a]'
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
            className={`mb-4 px-4 py-3 text-sm font-mono border ${
              designMessage.type === 'success'
                ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff8820]'
                : 'border-[#ff4444] text-[#ff4444] bg-[#ff444420]'
            }`}
          >
            {designMessage.text}
          </div>
        )}
        <div className="card overflow-hidden">
          <div className="border-b border-[#27273a] px-6 py-4">
            <div className="flex gap-6">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`text-sm font-medium transition-all pb-2 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-[#00f0ff] border-[#00f0ff]'
                      : 'text-[#a1a1aa] border-transparent hover:text-[#e4e4e7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="aspect-video bg-[#0a0a0f]">{renderPreview()}</div>
        </div>
      </main>
    </div>
  );
}
