import type { ExportRequest, ExportResult, ExportFormat } from './types';

type FixtureOutputMapper = (outputPath: string) => string[];

const FIXTURE_OUTPUTS: Record<ExportFormat, FixtureOutputMapper> = {
  schematic_pdf: (outputPath) => [`${outputPath}/schematic.pdf`],
  schematic_svg: (outputPath) => [`${outputPath}/schematic.svg`],
  netlist: (outputPath) => [`${outputPath}/netlist.net`],
  pcb_svg: (outputPath) => [`${outputPath}/pcb.svg`],
  pcb_glb: (outputPath) => [`${outputPath}/pcb.glb`],
  gerbers: (outputPath) => [
    `${outputPath}/front.gbr`,
    `${outputPath}/back.gbr`,
    `${outputPath}/silkscreen-front.gbr`,
    `${outputPath}/silkscreen-back.gbr`,
    `${outputPath}/soldermask-front.gbr`,
    `${outputPath}/soldermask-back.gbr`,
  ],
  pos: (outputPath) => [`${outputPath}/pos.csv`],
  ipc2581: (outputPath) => [`${outputPath}/ipc2581.xml`],
  odb: (outputPath) => [`${outputPath}/odb/`],
  bom_csv: (outputPath) => [`${outputPath}/bom.csv`],
};

export function runExport(request: ExportRequest): ExportResult {
  const startTime = performance.now();
  const errors: string[] = [];

  if (!request.projectId || request.projectId.trim().length === 0) {
    errors.push('projectId is required');
  }
  if (!request.projectPath || request.projectPath.trim().length === 0) {
    errors.push('projectPath is required');
  }
  if (!request.outputPath || request.outputPath.trim().length === 0) {
    errors.push('outputPath is required');
  }

  if (errors.length > 0) {
    return {
      projectId: request.projectId,
      format: request.format,
      success: false,
      outputFiles: [],
      errors,
      duration: performance.now() - startTime,
    };
  }

  const mapper = FIXTURE_OUTPUTS[request.format];
  if (!mapper) {
    return {
      projectId: request.projectId,
      format: request.format,
      success: false,
      outputFiles: [],
      errors: [`Unsupported export format: ${request.format}`],
      duration: performance.now() - startTime,
    };
  }

  const outputFiles = mapper(request.outputPath);

  return {
    projectId: request.projectId,
    format: request.format,
    success: true,
    outputFiles,
    errors: [],
    duration: performance.now() - startTime,
  };
}
