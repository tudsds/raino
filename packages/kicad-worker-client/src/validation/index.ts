import type { DesignJobResult } from '../contracts/jobs';

export interface ErcValidationResult {
  passed: boolean;
  violations: string[];
}

export interface DrcValidationResult {
  passed: boolean;
  violations: string[];
}

export interface ExportValidationResult {
  filesPresent: boolean;
  expectedFiles: string[];
}

/**
 * Validate the result of an ERC (Electrical Rules Check) run.
 * Parses stdout/stderr for known violation markers.
 */
export function validateErcResult(result: DesignJobResult): ErcValidationResult {
  const violations: string[] = [];

  if (result.exitCode !== 0) {
    violations.push(`ERC exited with non-zero code: ${result.exitCode}`);
  }

  const output = `${result.stdout}\n${result.stderr}`;

  const errorMatch = output.match(/(\d+)\s+error(s)?/i);
  if (errorMatch?.[1] && parseInt(errorMatch[1], 10) > 0) {
    violations.push(`ERC reported ${errorMatch[1]} error(s)`);
  }

  const warningMatch = output.match(/(\d+)\s+warning(s)?/i);
  if (warningMatch?.[1] && parseInt(warningMatch[1], 10) > 0) {
    violations.push(`ERC reported ${warningMatch[1]} warning(s)`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Validate the result of a DRC (Design Rules Check) run.
 * Parses stdout/stderr for known violation markers.
 */
export function validateDrcResult(result: DesignJobResult): DrcValidationResult {
  const violations: string[] = [];

  if (result.exitCode !== 0) {
    violations.push(`DRC exited with non-zero code: ${result.exitCode}`);
  }

  const output = `${result.stdout}\n${result.stderr}`;

  const errorMatch = output.match(/(\d+)\s+(error|problem)(s)?/i);
  if (errorMatch?.[1] && parseInt(errorMatch[1], 10) > 0) {
    violations.push(`DRC reported ${errorMatch[1]} error(s)`);
  }

  const unconnectedMatch = output.match(/(\d+)\s+unconnected/i);
  if (unconnectedMatch?.[1] && parseInt(unconnectedMatch[1], 10) > 0) {
    violations.push(`DRC reported ${unconnectedMatch[1]} unconnected pad(s)`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Validate that an export job produced the expected output files.
 */
export function validateExportResult(result: DesignJobResult): ExportValidationResult {
  const hasFiles = result.outputFiles.length > 0 && result.exitCode === 0;
  return {
    filesPresent: hasFiles,
    expectedFiles: result.outputFiles,
  };
}
