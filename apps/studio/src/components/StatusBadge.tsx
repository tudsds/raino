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
    className: 'glass-surface text-[#94A3B8]',
  },
  intake: {
    label: 'Intake',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  clarifying: {
    label: 'Clarifying',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  spec_compiled: {
    label: 'Spec Compiled',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  specification: {
    label: 'Specification',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  architecture_planned: {
    label: 'Architecture',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  candidates_discovered: {
    label: 'Candidates',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  ingested: {
    label: 'Ingested',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  bom_generated: {
    label: 'BOM Ready',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  design_pending: {
    label: 'Design Pending',
    className: 'glass-surface text-[#FF9800]',
  },
  design_generated: {
    label: 'Design',
    className: 'glass-surface text-[#FF9800]',
  },
  design: {
    label: 'Design',
    className: 'glass-surface text-[#FF9800]',
  },
  validated: {
    label: 'Validated',
    className: 'glass-surface text-[#4CAF50]',
  },
  validation: {
    label: 'Validation',
    className: 'glass-surface text-[#FF9800]',
  },
  exported: {
    label: 'Exported',
    className: 'glass-surface text-[#4CAF50]',
  },
  quoted: {
    label: 'Quoted',
    className: 'glass-surface text-[#4CAF50]',
  },
  quoting: {
    label: 'Quoting',
    className: 'glass-surface text-[#FF9800]',
  },
  completed: {
    label: 'Completed',
    className: 'glass-surface text-[#4CAF50]',
  },
  handed_off: {
    label: 'Handed Off',
    className: 'glass-surface text-[#4CAF50]',
  },
  'handed-off': {
    label: 'Handed Off',
    className: 'glass-surface text-[#4CAF50]',
  },
  active: {
    label: 'Active',
    className: 'glass-blue-tint text-[#6191D3]',
  },
  in_review: {
    label: 'In Review',
    className: 'glass-surface text-[#FF9800]',
  },
  archived: {
    label: 'Archived',
    className: 'glass-surface text-[#94A3B8]',
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
