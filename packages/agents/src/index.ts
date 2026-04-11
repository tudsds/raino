// Workflow
export {
  WorkflowState,
  ValidTransitions,
  WorkflowStateLabels,
  type WorkflowStateType,
} from './workflow/states';

export {
  WorkflowMachine,
  InvalidTransitionError,
  type TransitionEntry,
  type SerializedMachine,
} from './workflow/machine';

// Prompts
export type { PromptCategory, PromptTemplate, PromptExecution } from './prompts/types';

export {
  intakeTemplate,
  clarificationTemplate,
  specCompilationTemplate,
  architectureSelectionTemplate,
  bomGenerationTemplate,
  allTemplates,
  getTemplateById,
  getTemplatesByCategory,
} from './prompts/templates';

// Contracts — inter-service types
export type {
  IntakeRequest,
  IntakeResponse,
  ClarificationAnswer,
  SpecCompileRequest,
  ArchitecturePlanRequest,
  BOMGenerateRequest,
  DesignGenerateRequest,
  QuoteRequest,
  ProjectHandoffRequest,
} from './contracts/types';

// Contracts — worker types
export type {
  WorkerJobType,
  WorkerJobStatus,
  WorkerJob,
  WorkerJobResult,
  WorkerQueueConfig,
} from './contracts/worker';

// Orchestration
export {
  PipelineCoordinator,
  type StepResult,
  type StepExecuteFn,
} from './orchestration/coordinator';
