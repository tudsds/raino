import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ExportRequest, ExportResult, ExportFormat } from './types';
import { KicadCliCommands } from '@raino/kicad-worker-client';

const execFileAsync = promisify(execFile);

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

function getKicadCliPath(): string | null {
  return process.env.KICAD_CLI_PATH ?? null;
}

type KiCadExportCommand = (
  projectPath: string,
  outputPath: string,
) => { command: string; args: string[]; description: string };

const KICAD_EXPORT_COMMANDS: Partial<Record<ExportFormat, KiCadExportCommand>> = {
  schematic_pdf: (projectPath, outputPath) =>
    KicadCliCommands.schExportPdf(projectPath, outputPath),
  schematic_svg: (projectPath, outputPath) =>
    KicadCliCommands.schExportSvg(projectPath, outputPath),
  netlist: (projectPath, outputPath) => KicadCliCommands.schExportNetlist(projectPath, outputPath),
  pcb_svg: (projectPath, outputPath) => KicadCliCommands.pcbExportSvg(projectPath, outputPath),
  pcb_glb: (projectPath, outputPath) => KicadCliCommands.pcbExportGlb(projectPath, outputPath),
  gerbers: (projectPath, outputPath) => KicadCliCommands.pcbExportGerbers(projectPath, outputPath),
  pos: (projectPath, outputPath) => KicadCliCommands.pcbExportPos(projectPath, outputPath),
  ipc2581: (projectPath, outputPath) => KicadCliCommands.pcbExportIpc2581(projectPath, outputPath),
  odb: (projectPath, outputPath) => KicadCliCommands.pcbExportOdb(projectPath, outputPath),
};

function validateExportRequest(request: ExportRequest): string[] {
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
  return errors;
}

export function runExport(request: ExportRequest): ExportResult {
  const startTime = performance.now();
  const errors = validateExportRequest(request);

  if (errors.length > 0) {
    return {
      projectId: request.projectId,
      format: request.format,
      success: false,
      outputFiles: [],
      errors,
      duration: performance.now() - startTime,
      isPlaceholder: false,
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
      isPlaceholder: false,
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
    isPlaceholder: true,
  };
}

export async function runExportAsync(request: ExportRequest): Promise<ExportResult> {
  const cliPath = getKicadCliPath();
  if (!cliPath) {
    return runExport(request);
  }

  const startTime = performance.now();
  const errors = validateExportRequest(request);

  if (errors.length > 0) {
    return {
      projectId: request.projectId,
      format: request.format,
      success: false,
      outputFiles: [],
      errors,
      duration: performance.now() - startTime,
      isPlaceholder: false,
    };
  }

  const commandBuilder = KICAD_EXPORT_COMMANDS[request.format];
  if (!commandBuilder) {
    return {
      projectId: request.projectId,
      format: request.format,
      success: false,
      outputFiles: [],
      errors: [`Unsupported export format: ${request.format}`],
      duration: performance.now() - startTime,
      isPlaceholder: false,
    };
  }

  const command = commandBuilder(request.projectPath, request.outputPath);

  try {
    await execFileAsync(command.command, [...command.args], {
      timeout: 300_000,
    });

    const mapper = FIXTURE_OUTPUTS[request.format];
    const outputFiles = mapper ? mapper(request.outputPath) : [];

    return {
      projectId: request.projectId,
      format: request.format,
      success: true,
      outputFiles,
      errors: [],
      duration: performance.now() - startTime,
      isPlaceholder: false,
    };
  } catch (err) {
    return {
      projectId: request.projectId,
      format: request.format,
      success: false,
      outputFiles: [],
      errors: [`KiCad CLI export failed: ${err instanceof Error ? err.message : String(err)}`],
      duration: performance.now() - startTime,
      isPlaceholder: false,
    };
  }
}
