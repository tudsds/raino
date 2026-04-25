interface WorkflowProgressProps {
  progress: number;
  showSteps?: boolean;
}

const steps = [
  'Intake',
  'Spec',
  'Architecture',
  'Parts',
  'Ingest',
  'BOM',
  'Design',
  'Validate',
  'Preview',
  'Export',
  'Quote',
  'Done',
];

export default function WorkflowProgress({ progress, showSteps = false }: WorkflowProgressProps) {
  const currentStep = Math.floor((progress / 100) * steps.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-base font-[family-name:var(--font-body)]">
        <span className="text-[#64748B]">Progress</span>
        <span className="text-[#1565C0] font-[family-name:var(--font-body)] font-bold">
          {progress}%
        </span>
      </div>

      <div className="h-3 bg-[#0D2137] overflow-hidden border border-white/[0.12] rounded-lg">
        <div
          className="h-full bg-[#1565C0] transition-all duration-300 rounded-lg"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showSteps && (
        <div className="grid grid-cols-12 gap-1 pt-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step}
                className="text-center"
              >
                <div
                  className={`w-8 h-8 mx-auto flex items-center justify-center text-xs font-[family-name:var(--font-heading)] mb-1 rounded-lg ${
                    isCompleted
                      ? 'bg-[#4CAF50] text-white'
                      : isCurrent
                        ? 'bg-[#1565C0] text-white'
                        : 'bg-[#0D2137] text-[#64748B] border border-white/[0.12]'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[10px] font-[family-name:var(--font-body)] ${
                    isCompleted || isCurrent ? 'text-[#E2E8F0]' : 'text-[#64748B]'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
