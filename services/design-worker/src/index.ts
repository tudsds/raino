export type {
  BomComponent,
  ArchitectureSpec,
  ProjectGenerationRequest,
  ProjectGenerationResult,
} from './generator/types';

export type { KiCadSymbolMapping } from './generator/symbol-mapper';
export { mapBomToKiCad } from './generator/symbol-mapper';

export { generateKiCadProject } from './generator/project';

export type {
  CheckType,
  ValidationRequest,
  ValidationViolation,
  ValidationResult,
} from './validator/types';
export { runValidation, runValidationAsync } from './validator/engine';

export type { ExportFormat, ExportRequest, ExportResult } from './exporter/types';
export { runExport, runExportAsync } from './exporter/engine';

export type { PreviewAssets } from './exporter/preview';
export { generatePreviewAssets } from './exporter/preview';

export {
  generateArtifactManifest,
  uploadArtifactsToStorage,
  type ArtifactManifestEntry,
  type ArtifactManifest,
} from './artifacts/manifest';

export {
  pollAndExecuteJob,
  pollAndExecuteWithPrisma,
  executeJob,
  type JobType,
  type JobInput,
  type JobResult,
} from './queue/worker';
