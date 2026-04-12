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
        <span className="text-[#64748b]">Progress</span>
        <span className="text-[#00f0ff] font-[family-name:var(--font-mono)] font-bold">
          {progress}%
        </span>
      </div>

      <div className="h-3 bg-[#1a1a2e] overflow-hidden border border-[#27272a]">
        <div
          className="h-full progress-neon transition-all duration-100"
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
                className={`text-center ${index < 11 ? 'step-connector' : ''} ${
                  isCompleted ? 'step-connector-completed' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 mx-auto flex items-center justify-center text-xs font-[family-name:var(--font-heading)] mb-1 ${
                    isCompleted
                      ? 'bg-[#00ff88] text-[#0a0a0f]'
                      : isCurrent
                        ? 'bg-[#00f0ff] text-[#0a0a0f]'
                        : 'bg-[#1a1a2e] text-[#64748b] border-2 border-[#27272a]'
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
                    isCompleted || isCurrent ? 'text-[#e4e4e7]' : 'text-[#64748b]'
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
