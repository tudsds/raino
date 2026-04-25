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
          className="border border-[#00f0ff] text-[#00f0ff] px-6 py-2.5 text-sm font-medium hover:bg-[#00f0ff] hover:text-[#0a0a0f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating BOM...' : 'Generate BOM'}
        </button>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="border border-[#3a3a5a] text-[#a1a1aa] px-4 py-2 text-sm hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Regenerating...' : 'Regenerate BOM'}
        </button>
      )}
      {message && (
        <div
          className={`px-4 py-2 text-sm font-mono border ${
            message.type === 'success'
              ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff8820]'
              : 'border-[#ff4444] text-[#ff4444] bg-[#ff444420]'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
