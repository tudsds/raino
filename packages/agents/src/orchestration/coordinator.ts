export interface StepResult {
  step: string;
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
}

export type StepExecuteFn = (input: unknown) => Promise<StepResult>;

interface PipelineStep {
  name: string;
  execute: StepExecuteFn;
}

export class PipelineCoordinator {
  private steps: PipelineStep[];

  constructor() {
    this.steps = [];
  }

  addStep(name: string, execute: StepExecuteFn): void {
    this.steps.push({ name, execute });
  }

  async execute(initialInput: unknown): Promise<StepResult[]> {
    const results: StepResult[] = [];
    let currentInput: unknown = initialInput;

    for (const step of this.steps) {
      const stepResult = await step.execute(currentInput);
      results.push(stepResult);

      if (!stepResult.success) {
        break;
      }

      currentInput = stepResult.output;
    }

    return results;
  }

  getStepNames(): string[] {
    return this.steps.map((s) => s.name);
  }

  getStepCount(): number {
    return this.steps.length;
  }

  clear(): void {
    this.steps = [];
  }
}
