'use client';

import { useState, useCallback } from 'react';

interface ShortlistPageClientProps {
  projectId: string;
  promoted: boolean;
}

export default function ShortlistPageClient({ projectId, promoted: initialPromoted }: ShortlistPageClientProps) {
  const [promoting, setPromoting] = useState(false);
  const [promoted, setPromoted] = useState(initialPromoted);
  const [error, setError] = useState<string | null>(null);

  const handlePromote = useCallback(async () => {
    setPromoting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/ingest/promote`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Promotion failed' }));
        throw new Error(data.error || 'Promotion failed');
      }
      setPromoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  }, [projectId]);

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-xs text-[#EF5350]">{error}</span>
      )}
      <button
        onClick={handlePromote}
        disabled={promoting || promoted}
        className={`glass-elevated px-4 py-2 text-sm font-medium transition-all duration-200 ${
          promoted
            ? 'text-[#4CAF50] cursor-default'
            : promoting
              ? 'text-[#94A3B8] cursor-wait'
              : 'text-[#E2E8F0] hover:scale-[1.02] cursor-pointer'
        }`}
      >
        {promoted ? 'Promoted' : promoting ? 'Promoting...' : 'Promote Candidates'}
      </button>
    </div>
  );
}
