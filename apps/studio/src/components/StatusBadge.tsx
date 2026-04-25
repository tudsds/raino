export type Status =
  | 'draft'
  | 'intake'
  | 'clarifying'
  | 'spec_compiled'
  | 'specification'
  | 'architecture_planned'
  | 'candidates_discovered'
  | 'ingested'
  | 'bom_generated'
  | 'design_pending'
  | 'design_generated'
  | 'design'
  | 'validated'
  | 'validation'
  | 'exported'
  | 'quoted'
  | 'quoting'
  | 'completed'
  | 'handed_off'
  | 'handed-off'
  | 'active'
  | 'in_review'
  | 'archived';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-white/[0.06] text-[#94A3B8] border border-white/[0.12]',
  },
  intake: {
    label: 'Intake',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  clarifying: {
    label: 'Clarifying',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  spec_compiled: {
    label: 'Spec Compiled',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  specification: {
    label: 'Specification',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  architecture_planned: {
    label: 'Architecture',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  candidates_discovered: {
    label: 'Candidates',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  ingested: {
    label: 'Ingested',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  bom_generated: {
    label: 'BOM Ready',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  design_pending: {
    label: 'Design Pending',
    className: 'bg-[rgba(255,152,0,0.15)] text-[#FF9800] border border-[rgba(255,152,0,0.3)]',
  },
  design_generated: {
    label: 'Design',
    className: 'bg-[rgba(255,152,0,0.15)] text-[#FF9800] border border-[rgba(255,152,0,0.3)]',
  },
  design: {
    label: 'Design',
    className: 'bg-[rgba(255,152,0,0.15)] text-[#FF9800] border border-[rgba(255,152,0,0.3)]',
  },
  validated: {
    label: 'Validated',
    className: 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50] border border-[rgba(76,175,80,0.3)]',
  },
  validation: {
    label: 'Validation',
    className: 'bg-[rgba(255,152,0,0.15)] text-[#FF9800] border border-[rgba(255,152,0,0.3)]',
  },
  exported: {
    label: 'Exported',
    className: 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50] border border-[rgba(76,175,80,0.3)]',
  },
  quoted: {
    label: 'Quoted',
    className: 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50] border border-[rgba(76,175,80,0.3)]',
  },
  quoting: {
    label: 'Quoting',
    className: 'bg-[rgba(255,152,0,0.15)] text-[#FF9800] border border-[rgba(255,152,0,0.3)]',
  },
  completed: {
    label: 'Completed',
    className: 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50] border border-[rgba(76,175,80,0.3)]',
  },
  handed_off: {
    label: 'Handed Off',
    className: 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50] border border-[rgba(76,175,80,0.3)]',
  },
  'handed-off': {
    label: 'Handed Off',
    className: 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50] border border-[rgba(76,175,80,0.3)]',
  },
  active: {
    label: 'Active',
    className: 'bg-[rgba(21,101,192,0.15)] text-[#6191D3] border border-[rgba(21,101,192,0.3)]',
  },
  in_review: {
    label: 'In Review',
    className: 'bg-[rgba(255,152,0,0.15)] text-[#FF9800] border border-[rgba(255,152,0,0.3)]',
  },
  archived: {
    label: 'Archived',
    className: 'bg-white/[0.06] text-[#94A3B8] border border-white/[0.12]',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`px-2.5 py-1 font-[family-name:var(--font-body)] text-base rounded-lg backdrop-blur-xl ${config.className}`}
    >
      {config.label}
    </span>
  );
}
