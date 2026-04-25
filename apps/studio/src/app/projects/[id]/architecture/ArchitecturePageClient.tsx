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
          className="border border-[#00f0ff] text-[#00f0ff] px-6 py-2.5 text-sm font-medium hover:bg-[#00f0ff] hover:text-[#0a0a0f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Architecture...' : 'Generate Architecture Plan'}
        </button>
      )}
      {hasArchitecture && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="border border-[#3a3a5a] text-[#a1a1aa] px-4 py-2 text-sm hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Regenerating...' : 'Regenerate Architecture'}
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
