'use client';

import { useState } from 'react';
import QuoteEmailModal from './QuoteEmailModal';
import NeonButton from './NeonButton';

interface ArtifactOption {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface QuoteActionsProps {
  projectId: string;
  defaultEmail: string;
  artifacts: ArtifactOption[];
}

export default function QuoteActions({ projectId, defaultEmail, artifacts }: QuoteActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="card p-6 border-[#00f0ff]/30 neon-glow-cyan">
        <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
          Request Quote
        </h3>
        <p className="text-sm text-[#64748b] mb-6">
          Ready to proceed? Submit your project for a formal PCBA quote from Raino.
        </p>
        <NeonButton className="w-full py-4 text-lg">Request PCBA Quote</NeonButton>
        <p className="text-xs text-[#64748b] mt-4 text-center">
          This will create an order intent and initiate the handoff process.
        </p>
      </div>

      <div className="card p-6 border-[#8b5cf6]/30">
        <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
          Professional Manufacturing Quote
        </h3>
        <p className="text-sm text-[#64748b] mb-6">
          Send your design files to a manufacturer for a detailed professional quote.
        </p>
        <NeonButton
          variant="secondary"
          className="w-full py-4 text-lg"
          onClick={() => setModalOpen(true)}
        >
          Request Professional Quote
        </NeonButton>
        <p className="text-xs text-[#64748b] mt-4 text-center">
          Select which files to include and we will send them via email.
        </p>
      </div>

      <QuoteEmailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        defaultEmail={defaultEmail}
        artifacts={artifacts}
      />
    </>
  );
}
