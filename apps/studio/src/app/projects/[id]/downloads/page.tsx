'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/format';
import type { ReactElement } from 'react';

interface DownloadItem {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  checksum: string;
  generatedAt: string;
  mimeType: string;
  filePath: string;
  storageBucket?: string;
  storageKey?: string;
}

interface DownloadsAPIResponse {
  projectId: string;
  downloads: DownloadItem[];
  isPlaceholder: boolean;
  meta?: { mode: string; reason: string };
}

function FileIcon({ type }: { type: string }) {
  const icons: Record<string, ReactElement> = {
    'schematic-pdf': (
      <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    'schematic-svg': (
      <svg className="w-5 h-5 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    gerbers: (
      <svg className="w-5 h-5 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    'pcb-3d': (
      <svg className="w-5 h-5 text-[#6191D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    'bom-csv': (
      <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    netlist: (
      <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    bundle: (
      <svg className="w-5 h-5 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  };
  return icons[type] || icons.bundle;
}

export default function DownloadsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`/api/projects/${id}/downloads`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: DownloadsAPIResponse = await res.json();
        setDownloads(data.downloads);
        setIsPlaceholder(data.isPlaceholder);
      } catch {
        setDownloads([]);
        setIsPlaceholder(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloads();
  }, [id]);

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads`, active: true },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

  const totalSize = downloads.reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <header className="border-b border-white/[0.12] bg-[#0A1929]/80 backdrop-blur-xl sticky top-0 z-50">
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
              <h1 className="text-xl font-bold text-[#E2E8F0]">Downloads</h1>
              <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">{id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-white/[0.12] bg-[#132F4C]/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#1565C0] border-[#1565C0]'
                    : 'text-[#94A3B8] border-transparent hover:text-[#E2E8F0] hover:border-white/[0.12]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass-surface p-8 text-center">
                <p className="text-[#64748b]">Loading downloads...</p>
              </div>
            ) : downloads.length === 0 ? (
              <div className="glass-surface p-8 text-center">
                <h2 className="text-lg font-semibold text-[#E2E8F0] mb-2">
                  No Downloads Available
                </h2>
                <p className="text-[#64748b]">
                  Design artifacts will appear here after generation.
                </p>
              </div>
            ) : (
              <div className="glass-elevated overflow-hidden">
                <div className="p-4 border-b border-white/[0.12]">
                  <h2 className="text-lg font-semibold text-[#E2E8F0]">Available Files</h2>
                  <p className="text-sm text-[#64748b]">
                    Download manufacturing artifacts and design files
                  </p>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {downloads.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 glass-surface flex items-center justify-center">
                          <FileIcon type={file.type} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-[#E2E8F0]">{file.name}</h3>
                          <p className="text-xs text-[#64748b]">{formatBytes(file.sizeBytes)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (file.filePath) {
                            window.open(file.filePath, '_blank');
                          }
                        }}
                        className="glass-surface px-4 py-2 text-[#E2E8F0] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-surface glass-specular p-6">
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4 uppercase tracking-wider">
                File Manifest
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Total Files</span>
                  <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">{downloads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Total Size</span>
                  <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">{formatBytes(totalSize)}</span>
                </div>
                {isPlaceholder && (
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Mode</span>
                    <span className="text-[#FF9800] font-[family-name:var(--font-body)]">Placeholder</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
