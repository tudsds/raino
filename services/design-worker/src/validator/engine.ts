import type { ValidationRequest, ValidationResult, ValidationViolation, CheckType } from './types';

const MOCK_ERC_VIOLATIONS: ValidationViolation[] = [];

const MOCK_DRC_VIOLATIONS: ValidationViolation[] = [];

function runFixtureErc(projectId: string): ValidationResult {
  const startTime = performance.now();

  return {
    projectId,
    checkType: 'erc' as CheckType,
    passed: MOCK_ERC_VIOLATIONS.filter((v) => v.type === 'error').length === 0,
    violations: [...MOCK_ERC_VIOLATIONS],
    duration: performance.now() - startTime,
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
      };
    }
    return runner(request.projectId);
  });
}
