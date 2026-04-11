type Status =
  | 'draft'
  | 'intake'
  | 'specification'
  | 'architecture'
  | 'design'
  | 'validation'
  | 'quoting'
  | 'completed'
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
  specification: {
    label: 'Specification',
    className: 'badge-info',
  },
  architecture: {
    label: 'Architecture',
    className: 'badge-info',
  },
  design: {
    label: 'Design',
    className: 'badge-warning',
  },
  validation: {
    label: 'Validation',
    className: 'badge-warning',
  },
  quoting: {
    label: 'Quoting',
    className: 'badge-warning',
  },
  completed: {
    label: 'Completed',
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
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
