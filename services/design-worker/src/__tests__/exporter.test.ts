import { describe, it, expect, beforeEach } from 'vitest';
import { runExport, runExportAsync } from '../exporter/engine.js';
import type { ExportRequest } from '../exporter/types.js';

describe('runExport (fixture mode)', () => {
  beforeEach(() => {
    delete process.env.KICAD_CLI_PATH;
  });

  it('returns fixture output files for schematic_pdf', () => {
    const request: ExportRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      format: 'schematic_pdf',
      outputPath: '/tmp/output',
    };

    const result = runExport(request);
    expect(result.success).toBe(true);
    expect(result.outputFiles).toHaveLength(1);
    expect(result.outputFiles[0]).toContain('schematic.pdf');
    expect(result.isPlaceholder).toBe(true);
  });

  it('returns fixture output files for gerbers', () => {
    const request: ExportRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      format: 'gerbers',
      outputPath: '/tmp/output',
    };

    const result = runExport(request);
    expect(result.success).toBe(true);
    expect(result.outputFiles).toHaveLength(6);
    expect(result.isPlaceholder).toBe(true);
  });

  it('returns error for missing projectId', () => {
    const request: ExportRequest = {
      projectId: '',
      projectPath: '/tmp/test',
      format: 'pcb_svg',
      outputPath: '/tmp/output',
    };

    const result = runExport(request);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('projectId is required');
  });

  it('returns error for missing projectPath', () => {
    const request: ExportRequest = {
      projectId: 'test',
      projectPath: '',
      format: 'pcb_svg',
      outputPath: '/tmp/output',
    };

    const result = runExport(request);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('projectPath is required');
  });

  it('returns error for missing outputPath', () => {
    const request: ExportRequest = {
      projectId: 'test',
      projectPath: '/tmp/test',
      format: 'pcb_svg',
      outputPath: '',
    };

    const result = runExport(request);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('outputPath is required');
  });
});

describe('runExportAsync', () => {
  beforeEach(() => {
    delete process.env.KICAD_CLI_PATH;
  });

  it('falls back to fixture mode when KICAD_CLI_PATH not set', async () => {
    const request: ExportRequest = {
      projectId: 'test-project',
      projectPath: '/tmp/test-project',
      format: 'pcb_svg',
      outputPath: '/tmp/output',
    };

    const result = await runExportAsync(request);
    expect(result.success).toBe(true);
    expect(result.isPlaceholder).toBe(true);
  });
});
