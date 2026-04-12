import { describe, it, expect, beforeEach } from 'vitest';
import { runValidation, runValidationAsync } from '../validator/engine.js';
import type { ValidationRequest } from '../validator/types.js';

describe('runValidation (fixture mode)', () => {
  beforeEach(() => {
    delete process.env.KICAD_CLI_PATH;
  });

  it('returns fixture ERC results when KiCad CLI not available', () => {
    const request: ValidationRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      checks: ['erc'],
    };

    const results = runValidation(request);
    expect(results).toHaveLength(1);
    expect(results[0]!.checkType).toBe('erc');
    expect(results[0]!.passed).toBe(true);
    expect(results[0]!.isPlaceholder).toBe(true);
  });

  it('returns fixture DRC results when KiCad CLI not available', () => {
    const request: ValidationRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      checks: ['drc'],
    };

    const results = runValidation(request);
    expect(results).toHaveLength(1);
    expect(results[0]!.checkType).toBe('drc');
    expect(results[0]!.passed).toBe(true);
    expect(results[0]!.isPlaceholder).toBe(true);
  });

  it('returns both ERC and DRC results', () => {
    const request: ValidationRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      checks: ['erc', 'drc'],
    };

    const results = runValidation(request);
    expect(results).toHaveLength(2);
    expect(results[0]!.checkType).toBe('erc');
    expect(results[1]!.checkType).toBe('drc');
  });

  it('returns error for unknown check type', () => {
    const request: ValidationRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      checks: ['erc'],
    };

    const results = runValidation(request);
    expect(results[0]!.violations).toHaveLength(0);
  });
});

describe('runValidationAsync', () => {
  beforeEach(() => {
    delete process.env.KICAD_CLI_PATH;
  });

  it('falls back to fixture mode when KICAD_CLI_PATH not set', async () => {
    const request: ValidationRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      checks: ['erc'],
    };

    const results = await runValidationAsync(request);
    expect(results).toHaveLength(1);
    expect(results[0]!.checkType).toBe('erc');
    expect(results[0]!.isPlaceholder).toBe(true);
  });
});
