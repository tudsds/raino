import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ValidationRequest, ValidationResult, ValidationViolation, CheckType } from './types';
import { KicadCliCommands } from '@raino/kicad-worker-client';

const execFileAsync = promisify(execFile);

const MOCK_ERC_VIOLATIONS: ValidationViolation[] = [];

const MOCK_DRC_VIOLATIONS: ValidationViolation[] = [];

function getKicadCliPath(): string | null {
  return process.env.KICAD_CLI_PATH ?? null;
}

function parseViolationsFromOutput(output: string, checkType: CheckType): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const errorPattern =
    checkType === 'erc' ? /ERC\s+report:\s*(\d+)\s+error/i : /DRC\s+report:\s*(\d+)\s+error/i;

  const errorMatch = output.match(errorPattern);
  if (errorMatch?.[1] && parseInt(errorMatch[1], 10) > 0) {
    violations.push({
      type: 'error',
      category: checkType,
      message: `${checkType.toUpperCase()} reported ${errorMatch[1]} error(s)`,
      severity: 10,
    });
  }

  const unconnectedPattern = /(\d+)\s+unconnected/i;
  const unconnectedMatch = output.match(unconnectedPattern);
  if (checkType === 'drc' && unconnectedMatch?.[1] && parseInt(unconnectedMatch[1], 10) > 0) {
    violations.push({
      type: 'warning',
      category: 'drc',
      message: `DRC reported ${unconnectedMatch[1]} unconnected pad(s)`,
      severity: 5,
    });
  }

  return violations;
}

async function runRealKiCadCheck(
  projectId: string,
  checkType: CheckType,
  projectPath: string,
): Promise<ValidationResult> {
  const startTime = performance.now();
  const cliPath = getKicadCliPath();
  if (!cliPath) {
    throw new Error('KICAD_CLI_PATH not set');
  }

  const command =
    checkType === 'erc'
      ? KicadCliCommands.schErc(projectPath)
      : KicadCliCommands.pcbDrc(projectPath);

  try {
    const { stdout, stderr } = await execFileAsync(command.command, [...command.args], {
      timeout: 120_000,
    });

    const fullOutput = `${stdout}\n${stderr}`;
    const violations = parseViolationsFromOutput(fullOutput, checkType);

    return {
      projectId,
      checkType,
      passed: violations.filter((v) => v.type === 'error').length === 0,
      violations,
      duration: performance.now() - startTime,
    };
  } catch (err) {
    const errorViolations: ValidationViolation[] = [
      {
        type: 'error',
        category: 'system',
        message: `KiCad CLI ${checkType.toUpperCase()} failed: ${err instanceof Error ? err.message : String(err)}`,
        severity: 10,
      },
    ];

    return {
      projectId,
      checkType,
      passed: false,
      violations: errorViolations,
      duration: performance.now() - startTime,
    };
  }
}

function runFixtureErc(projectId: string): ValidationResult {
  const startTime = performance.now();

  return {
    projectId,
    checkType: 'erc' as CheckType,
    passed: MOCK_ERC_VIOLATIONS.filter((v) => v.type === 'error').length === 0,
    violations: [...MOCK_ERC_VIOLATIONS],
    duration: performance.now() - startTime,
    isPlaceholder: true,
  };
}

function runFixtureDrc(projectId: string): ValidationResult {
  const startTime = performance.now();

  return {
    projectId,
    checkType: 'drc' as CheckType,
    passed: MOCK_DRC_VIOLATIONS.filter((v) => v.type === 'error').length === 0,
    violations: [...MOCK_DRC_VIOLATIONS],
    duration: performance.now() - startTime,
    isPlaceholder: true,
  };
}

const FIXTURE_RUNNERS: Record<CheckType, (projectId: string) => ValidationResult> = {
  erc: runFixtureErc,
  drc: runFixtureDrc,
};

export function runValidation(request: ValidationRequest): ValidationResult[] {
  return request.checks.map((check) => {
    const runner = FIXTURE_RUNNERS[check];
    if (!runner) {
      const startTime = performance.now();
      return {
        projectId: request.projectId,
        checkType: check,
        passed: false,
        violations: [
          {
            type: 'error' as const,
            category: 'system',
            message: `Unknown check type: ${check}`,
            severity: 10,
          },
        ],
        duration: performance.now() - startTime,
        isPlaceholder: true,
      };
    }
    return runner(request.projectId);
  });
}

export async function runValidationAsync(request: ValidationRequest): Promise<ValidationResult[]> {
  const cliPath = getKicadCliPath();
  if (!cliPath) {
    return runValidation(request);
  }

  const results: ValidationResult[] = [];
  for (const check of request.checks) {
    const result = await runRealKiCadCheck(request.projectId, check, request.projectPath);
    results.push(result);
  }

  return results;
}
