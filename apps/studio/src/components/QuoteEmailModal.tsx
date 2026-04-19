'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@raino/ui';
import { Button } from '@raino/ui';

interface ArtifactOption {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface QuoteEmailModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultEmail: string;
  artifacts: ArtifactOption[];
}

export default function QuoteEmailModal({
  open,
  onClose,
  projectId,
  defaultEmail,
  artifacts,
}: QuoteEmailModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [selectedArtifacts, setSelectedArtifacts] = useState<Set<string>>(
    () => new Set(artifacts.map((a) => a.id)),
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleArtifact = useCallback((id: string) => {
    setSelectedArtifacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSend = useCallback(async () => {
    if (selectedArtifacts.size === 0) {
      setStatus('error');
      setErrorMessage('Please select at least one file to attach.');
      return;
    }

    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter an email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const selected = artifacts.filter((a) => selectedArtifacts.has(a.id));
      const response = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          artifactUrls: selected.map((a) => ({ url: a.url, filename: a.name })),
          userEmail: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send email. Please try again.');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send email. Please try again.');
    }
  }, [artifacts, email, projectId, selectedArtifacts]);

  const handleClose = useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
    onClose();
  }, [onClose]);

  const artifactTypeLabels: Record<string, string> = {
    'schematic-pdf': 'Schematic (PDF)',
    'schematic-svg': 'Schematic (SVG)',
    gerbers: 'Gerber Files',
    'pcb-3d': 'PCB 3D Model',
    'bom-csv': 'Bill of Materials (CSV)',
    netlist: 'Netlist',
    bundle: 'Manufacturing Bundle',
  };

  return (
    <Modal open={open} onClose={handleClose} title="Request Professional Quote" size="md">
      <div className="space-y-6">
        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#22c55e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#e4e4e7] mb-2">Email Sent Successfully</h3>
            <p className="text-sm text-[#a1a1aa]">
              Your design files have been sent for a professional quote.
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#a1a1aa]">
              Would you like us to send your design files to a manufacturer for a professional
              quote?
            </p>

            <div className="space-y-2">
              <label className="text-xs text-[#64748b] uppercase tracking-wider">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 bg-[#1a1a24] border border-[#27273a] text-[#e4e4e7] text-sm placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#64748b] uppercase tracking-wider">
                Select Files to Attach
              </label>
              <div className="space-y-1">
                {artifacts.length === 0 ? (
                  <p className="text-sm text-[#64748b]">No downloadable artifacts available yet.</p>
                ) : (
                  artifacts.map((artifact) => (
                    <label
                      key={artifact.id}
                      className="flex items-center gap-3 p-2 hover:bg-[#1a1a24]/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedArtifacts.has(artifact.id)}
                        onChange={() => toggleArtifact(artifact.id)}
                        className="w-4 h-4 accent-[#00f0ff] bg-[#1a1a24] border-[#27273a]"
                      />
                      <span className="text-sm text-[#e4e4e7]">
                        {artifactTypeLabels[artifact.type] || artifact.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                <p className="text-sm text-[#ef4444]">{errorMessage}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={handleClose} disabled={status === 'loading'}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={status === 'loading' || artifacts.length === 0}
                glow
              >
                {status === 'loading' ? 'Sending...' : 'Send for Quote'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
