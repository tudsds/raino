export { KicadCliCommands, type KicadCommand } from './contracts/commands';
export { type DesignJob, type DesignJobResult, type DesignJobType } from './contracts/jobs';
export { type KicadWorkerClient } from './client/interface';
export { MockKicadWorkerClient } from './client/mock-client';
export {
  validateErcResult,
  validateDrcResult,
  validateExportResult,
  type ErcValidationResult,
  type DrcValidationResult,
  type ExportValidationResult,
} from './validation';
