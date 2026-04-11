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
export { runValidation } from './validator/engine';

export type { ExportFormat, ExportRequest, ExportResult } from './exporter/types';
export { runExport } from './exporter/engine';

export type { PreviewAssets } from './exporter/preview';
export { generatePreviewAssets } from './exporter/preview';
