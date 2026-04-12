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
    className: 'badge-neutral',
  },
  intake: {
    label: 'Intake',
    className: 'badge-info',
  },
  clarifying: {
    label: 'Clarifying',
    className: 'badge-info',
  },
  spec_compiled: {
    label: 'Spec Compiled',
    className: 'badge-info',
  },
  specification: {
    label: 'Specification',
    className: 'badge-info',
  },
  architecture_planned: {
    label: 'Architecture',
    className: 'badge-info',
  },
  candidates_discovered: {
    label: 'Candidates',
    className: 'badge-info',
  },
  ingested: {
    label: 'Ingested',
    className: 'badge-info',
  },
  bom_generated: {
    label: 'BOM Ready',
    className: 'badge-info',
  },
  design_generated: {
    label: 'Design',
    className: 'badge-warning',
  },
  design: {
    label: 'Design',
    className: 'badge-warning',
  },
  validated: {
    label: 'Validated',
    className: 'badge-success',
  },
  validation: {
    label: 'Validation',
    className: 'badge-warning',
  },
  exported: {
    label: 'Exported',
    className: 'badge-success',
  },
  quoted: {
    label: 'Quoted',
    className: 'badge-success',
  },
  quoting: {
    label: 'Quoting',
    className: 'badge-warning',
  },
  completed: {
    label: 'Completed',
    className: 'badge-success',
  },
  handed_off: {
    label: 'Handed Off',
    className: 'badge-success',
  },
  'handed-off': {
    label: 'Handed Off',
    className: 'badge-success',
  },
  active: {
    label: 'Active',
    className: 'badge-info',
  },
  in_review: {
    label: 'In Review',
    className: 'badge-warning',
  },
  archived: {
    label: 'Archived',
    className: 'badge-neutral',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`px-2.5 py-1 font-[family-name:var(--font-body)] text-base ${config.className}`}
    >
      {config.label}
    </span>
  );
}
