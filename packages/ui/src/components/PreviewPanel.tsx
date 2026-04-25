'use client';

import { Card } from './Card';

export interface PreviewPanelProps {
  type: 'schematic' | 'pcb2d' | 'pcb3d';
  imageUrl?: string;
  modelUrl?: string;
  loading?: boolean;
  error?: string;
}

export function PreviewPanel({
  type,
  imageUrl,
  modelUrl,
  loading = false,
  error,
}: PreviewPanelProps) {
  const typeLabels = {
    schematic: 'Schematic',
    pcb2d: 'PCB Layout (2D)',
    pcb3d: 'PCB Preview (3D)',
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.12]">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#1565C0]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {type === 'schematic' && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            )}
            {type === 'pcb2d' && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
              />
            )}
            {type === 'pcb3d' && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            )}
          </svg>
          <span className="text-base font-[family-name:var(--font-heading)] text-[#E2E8F0] uppercase text-xs tracking-wider">
            {typeLabels[type]}
          </span>
        </div>
      </div>

      <div className="relative aspect-video bg-[#0A1929] flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/[0.12] border-t-[#1565C0] animate-spin rounded-full" />
            <span className="text-base text-[#64748B] font-[family-name:var(--font-body)]">
              Loading preview...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <svg
              className="w-10 h-10 text-[#EF5350]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-base text-[#EF5350] font-[family-name:var(--font-body)]">
              {error}
            </span>
          </div>
        )}

        {imageUrl && !loading && !error && (
          <img
            src={imageUrl}
            alt={typeLabels[type]}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {!imageUrl && !modelUrl && !loading && !error && (
          <div className="flex flex-col items-center gap-3 text-[#64748B]">
            <svg
              className="w-12 h-12 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-base font-[family-name:var(--font-body)]">
              No preview available
            </span>
          </div>
        )}

        {modelUrl && !loading && !error && type === 'pcb3d' && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-base text-[#1565C0] font-[family-name:var(--font-body)]">
              3D Model Ready
            </span>
            <span className="text-sm text-[#64748B] font-[family-name:var(--font-mono)]">
              {modelUrl}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
