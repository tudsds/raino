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
            <div className="w-16 h-16 mx-auto mb-4 bg-[rgba(76,175,80,0.15)] border border-[rgba(76,175,80,0.3)] rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#4CAF50]"
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
            <h3 className="text-lg font-semibold text-[#E2E8F0] mb-2">Email Sent Successfully</h3>
            <p className="text-sm text-[#94A3B8]">
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
            <p className="text-sm text-[#94A3B8]">
              Would you like us to send your design files to a manufacturer for a professional
              quote?
            </p>

            <div className="space-y-2">
              <label className="text-xs text-[#64748B] uppercase tracking-wider">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 bg-[#0D2137] border border-white/[0.12] text-[#E2E8F0] text-sm placeholder-[#64748B] focus:outline-none focus:border-[#1565C0] transition-colors duration-300 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#64748B] uppercase tracking-wider">
                Select Files to Attach
              </label>
              <div className="space-y-1">
                {artifacts.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No downloadable artifacts available yet.</p>
                ) : (
                  artifacts.map((artifact) => (
                    <label
                      key={artifact.id}
                      className="flex items-center gap-3 p-2 hover:bg-white/[0.04] cursor-pointer transition-colors duration-300 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedArtifacts.has(artifact.id)}
                        onChange={() => toggleArtifact(artifact.id)}
                        className="w-4 h-4 accent-[#1565C0] bg-[#0D2137] border-white/[0.12]"
                      />
                      <span className="text-sm text-[#E2E8F0]">
                        {artifactTypeLabels[artifact.type] || artifact.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-[rgba(239,83,80,0.1)] border border-[rgba(239,83,80,0.3)] rounded-lg">
                <p className="text-sm text-[#EF5350]">{errorMessage}</p>
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
