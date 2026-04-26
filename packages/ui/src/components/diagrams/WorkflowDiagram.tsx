'use client';

import { GlassCard } from './GlassCard';

export interface WorkflowDiagramProps {
  className?: string;
}

export function WorkflowDiagram({ className }: WorkflowDiagramProps) {
  const stages = [
    'Natural Language Intake',
    'Clarifying Question Loop',
    'Structured Product Specification',
    'Approved Architecture Template Selection',
    'Candidate Part Family Selection',
    'Official Engineering Document Ingestion',
    'Structured Supplier Metadata Resolution',
    'RAG-Assisted Engineering Reasoning',
    'Full BOM with Alternates',
    'KiCad Project Generation',
    'ERC/DRC/Export Workflow',
    'Preview Asset Generation',
    'Downloadable Artifact Generation',
    'Raino Rough Quote Generation',
    'Optional "Request PCBA Quote" Handoff',
  ];

  return (
    <div className={`flex flex-col items-center gap-0 max-w-xl mx-auto ${className || ''}`}>
      {stages.map((stage, idx) => (
        <div key={stage} className="w-full flex flex-col items-center">
          <GlassCard
            className="px-6 py-3 w-full text-center"
            tint={idx === 0 ? 'accent' : 'default'}
            glassIntensity={idx === 0 ? 'elevated' : 'surface'}
          >
            <span className="text-white text-sm font-medium">{stage}</span>
          </GlassCard>
          {idx < stages.length - 1 && (
            <div className="flex flex-col items-center py-1.5">
              <div className="w-px h-4 bg-gradient-to-b from-[#1565C0]/30 to-[#6191D3]/20" />
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#6191D3]/30" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
