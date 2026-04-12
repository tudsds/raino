import { describe, it, expect } from 'vitest';

import { KicadCliCommands } from '../contracts/commands';
import type { DesignJobType } from '../contracts/jobs';
import { MockKicadWorkerClient } from '../client/mock-client';
import { validateErcResult, validateDrcResult, validateExportResult } from '../validation';

describe('KicadCliCommands', () => {
  it('generates schErc command', () => {
    const cmd = KicadCliCommands.schErc('/path/to/project.kicad_sch');
    expect(cmd.command).toBe('kicad-cli');
    expect(cmd.args).toEqual(['sch', 'erc', '/path/to/project.kicad_sch']);
    expect(cmd.description).toContain('electrical rules check');
  });

  it('generates pcbDrc command', () => {
    const cmd = KicadCliCommands.pcbDrc('/path/to/board.kicad_pcb');
    expect(cmd.command).toBe('kicad-cli');
    expect(cmd.args).toEqual(['pcb', 'drc', '/path/to/board.kicad_pcb']);
    expect(cmd.description).toContain('design rules check');
  });

  it('generates schExportPdf command', () => {
    const cmd = KicadCliCommands.schExportPdf('/proj.kicad_sch', '/out/schematic.pdf');
    expect(cmd.args).toEqual([
      'sch',
      'export',
      'pdf',
      '--output',
      '/out/schematic.pdf',
      '/proj.kicad_sch',
    ]);
  });

  it('generates schExportSvg command', () => {
    const cmd = KicadCliCommands.schExportSvg('/proj.kicad_sch', '/out/svg');
    expect(cmd.args).toEqual([
      'sch',
      'export',
      'svg',
      '--output-dir',
      '/out/svg',
      '/proj.kicad_sch',
    ]);
  });

  it('generates schExportNetlist command', () => {
    const cmd = KicadCliCommands.schExportNetlist('/proj.kicad_sch', '/out/netlist.net');
    expect(cmd.args).toEqual([
      'sch',
      'export',
      'netlist',
      '--output',
      '/out/netlist.net',
      '/proj.kicad_sch',
    ]);
  });

  it('generates pcbExportSvg command', () => {
    const cmd = KicadCliCommands.pcbExportSvg('/board.kicad_pcb', '/out/pcb.svg');
    expect(cmd.args).toEqual([
      'pcb',
      'export',
      'svg',
      '--output',
      '/out/pcb.svg',
      '/board.kicad_pcb',
    ]);
  });

  it('generates pcbExportGlb command', () => {
    const cmd = KicadCliCommands.pcbExportGlb('/board.kicad_pcb', '/out/pcb.glb');
    expect(cmd.args).toEqual([
      'pcb',
      'export',
      'glb',
      '--output',
      '/out/pcb.glb',
      '/board.kicad_pcb',
    ]);
  });

  it('generates pcbExportGerbers command', () => {
    const cmd = KicadCliCommands.pcbExportGerbers('/board.kicad_pcb', '/out/gerbers');
    expect(cmd.args).toEqual([
      'pcb',
      'export',
      'gerbers',
      '--output-dir',
      '/out/gerbers',
      '/board.kicad_pcb',
    ]);
  });

  it('generates pcbExportPos command', () => {
    const cmd = KicadCliCommands.pcbExportPos('/board.kicad_pcb', '/out/pos.csv');
    expect(cmd.args).toEqual([
      'pcb',
      'export',
      'pos',
      '--output',
      '/out/pos.csv',
      '/board.kicad_pcb',
    ]);
  });

  it('generates pcbExportIpc2581 command', () => {
    const cmd = KicadCliCommands.pcbExportIpc2581('/board.kicad_pcb', '/out/ipc2581.xml');
    expect(cmd.args).toEqual([
      'pcb',
      'export',
      'ipc2581',
      '--output',
      '/out/ipc2581.xml',
      '/board.kicad_pcb',
    ]);
  });

  it('generates pcbExportOdb command', () => {
    const cmd = KicadCliCommands.pcbExportOdb('/board.kicad_pcb', '/out/odb');
    expect(cmd.args).toEqual([
      'pcb',
      'export',
      'odb',
      '--output-dir',
      '/out/odb',
      '/board.kicad_pcb',
    ]);
  });

  it('all commands use kicad-cli as the command', () => {
    const methods = [
      KicadCliCommands.schErc,
      KicadCliCommands.pcbDrc,
      KicadCliCommands.schExportPdf,
      KicadCliCommands.schExportSvg,
      KicadCliCommands.schExportNetlist,
      KicadCliCommands.pcbExportSvg,
      KicadCliCommands.pcbExportGlb,
      KicadCliCommands.pcbExportGerbers,
      KicadCliCommands.pcbExportPos,
      KicadCliCommands.pcbExportIpc2581,
      KicadCliCommands.pcbExportOdb,
    ];

    for (const method of methods) {
      const cmd = method('/test.kicad_sch', '/output');
      expect(cmd.command).toBe('kicad-cli');
      expect(cmd.args.length).toBeGreaterThan(0);
      expect(cmd.description).toBeTruthy();
    }
  });
});

describe('DesignJobType values', () => {
  const validTypes: DesignJobType[] = [
    'generate_project',
    'run_erc',
    'run_drc',
    'export_schematic_pdf',
    'export_schematic_svg',
    'export_netlist',
    'export_pcb_svg',
    'export_pcb_glb',
    'export_gerbers',
    'export_pos',
    'export_ipc2581',
    'export_odb',
    'export_bom',
  ];

  it('has 13 valid job types', () => {
    expect(validTypes.length).toBe(13);
  });

  it('each type is a non-empty string', () => {
    for (const t of validTypes) {
      expect(t.length).toBeGreaterThan(0);
    }
  });
});

describe('MockKicadWorkerClient', () => {
  it('is available', async () => {
    const client = new MockKicadWorkerClient();
    expect(await client.isAvailable()).toBe(true);
  });

  it('submits a job and returns completed status', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({
      projectId: 'proj-1',
      type: 'run_erc',
    });

    expect(job.id).toBeTruthy();
    expect(job.id).toMatch(/^job_/);
    expect(job.status).toBe('completed');
    expect(job.projectId).toBe('proj-1');
    expect(job.type).toBe('run_erc');
    expect(job.result).toBeDefined();
    expect(job.result!.exitCode).toBe(0);
    expect(job.createdAt).toBeGreaterThan(0);
    expect(job.startedAt).toBeGreaterThan(0);
    expect(job.completedAt).toBeGreaterThan(0);
  });

  it('returns ERC stdout for run_erc jobs', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({ projectId: 'p', type: 'run_erc' });
    expect(job.result!.stdout).toContain('ERC');
  });

  it('returns DRC stdout for run_drc jobs', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({ projectId: 'p', type: 'run_drc' });
    expect(job.result!.stdout).toContain('DRC');
  });

  it('returns project generated stdout for generate_project', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({ projectId: 'p', type: 'generate_project' });
    expect(job.result!.stdout).toContain('generated');
  });

  it('produces correct output files for each export type', async () => {
    const client = new MockKicadWorkerClient();

    const testCases: Array<{ type: DesignJobType; expectedExtension: string }> = [
      { type: 'export_schematic_pdf', expectedExtension: '.pdf' },
      { type: 'export_schematic_svg', expectedExtension: '.svg' },
      { type: 'export_netlist', expectedExtension: '.net' },
      { type: 'export_pcb_svg', expectedExtension: '.svg' },
      { type: 'export_pcb_glb', expectedExtension: '.glb' },
      { type: 'export_pos', expectedExtension: '.csv' },
      { type: 'export_ipc2581', expectedExtension: '.xml' },
      { type: 'export_bom', expectedExtension: '.csv' },
    ];

    for (const tc of testCases) {
      const job = await client.submitJob({ projectId: 'p', type: tc.type });
      expect(job.result!.outputFiles.length).toBeGreaterThan(0);
      expect(job.result!.outputFiles[0]).toContain(tc.expectedExtension);
    }
  });

  it('produces multiple gerber files', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({ projectId: 'p', type: 'export_gerbers' });
    expect(job.result!.outputFiles.length).toBe(6);
    expect(job.result!.outputFiles[0]).toContain('.gbr');
  });

  it('uses custom output path when provided', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({
      projectId: 'p',
      type: 'export_schematic_pdf',
      outputPath: '/custom/output',
    });
    expect(job.result!.outputFiles[0]).toContain('/custom/output');
  });

  it('gets job status by id', async () => {
    const client = new MockKicadWorkerClient();
    const submitted = await client.submitJob({ projectId: 'p', type: 'run_erc' });
    const status = await client.getJobStatus(submitted.id);
    expect(status.id).toBe(submitted.id);
    expect(status.status).toBe('completed');
  });

  it('throws when getting status of unknown job', async () => {
    const client = new MockKicadWorkerClient();
    await expect(client.getJobStatus('nonexistent')).rejects.toThrow('Job not found');
  });

  it('gets job result by id', async () => {
    const client = new MockKicadWorkerClient();
    const submitted = await client.submitJob({ projectId: 'p', type: 'run_erc' });
    const result = await client.getJobResult(submitted.id);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBeTruthy();
  });

  it('lists jobs filtered by projectId', async () => {
    const client = new MockKicadWorkerClient();
    await client.submitJob({ projectId: 'proj-a', type: 'run_erc' });
    await client.submitJob({ projectId: 'proj-a', type: 'run_drc' });
    await client.submitJob({ projectId: 'proj-b', type: 'run_erc' });

    const projAJobs = await client.listJobs('proj-a');
    const projBJobs = await client.listJobs('proj-b');

    expect(projAJobs.length).toBe(2);
    expect(projBJobs.length).toBe(1);
  });

  it('cancelJob throws for completed job', async () => {
    const client = new MockKicadWorkerClient();
    const job = await client.submitJob({ projectId: 'p', type: 'run_erc' });
    await expect(client.cancelJob(job.id)).rejects.toThrow('Cannot cancel completed job');
  });

  it('cancelJob throws for unknown job', async () => {
    const client = new MockKicadWorkerClient();
    await expect(client.cancelJob('nonexistent')).rejects.toThrow('Job not found');
  });
});

describe('validateErcResult', () => {
  it('passes for clean result', () => {
    const result = validateErcResult({
      exitCode: 0,
      stdout: 'ERC report: 0 errors, 0 warnings\n ERC OK',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('fails for non-zero exit code', () => {
    const result = validateErcResult({
      exitCode: 1,
      stdout: '',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0]).toContain('non-zero');
  });

  it('detects errors in stdout', () => {
    const result = validateErcResult({
      exitCode: 0,
      stdout: 'ERC report: 3 errors, 0 warnings',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toEqual(expect.arrayContaining([expect.stringContaining('3 error')]));
  });

  it('detects warnings in stderr', () => {
    const result = validateErcResult({
      exitCode: 0,
      stdout: '',
      stderr: 'ERC report: 0 errors, 5 warnings',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([expect.stringContaining('5 warning')]),
    );
  });
});

describe('validateDrcResult', () => {
  it('passes for clean result', () => {
    const result = validateDrcResult({
      exitCode: 0,
      stdout: 'DRC report: 0 errors, 0 unconnected pads\n DRC OK',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('fails for non-zero exit code', () => {
    const result = validateDrcResult({
      exitCode: 1,
      stdout: '',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(false);
  });

  it('detects errors in output', () => {
    const result = validateDrcResult({
      exitCode: 0,
      stdout: 'DRC report: 2 problems found',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toEqual(expect.arrayContaining([expect.stringContaining('2 error')]));
  });

  it('detects unconnected pads', () => {
    const result = validateDrcResult({
      exitCode: 0,
      stdout: 'DRC report: 0 errors, 3 unconnected pads',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([expect.stringContaining('3 unconnected')]),
    );
  });
});

describe('validateExportResult', () => {
  it('returns filesPresent true when files exist and exit code is 0', () => {
    const result = validateExportResult({
      exitCode: 0,
      stdout: '',
      stderr: '',
      outputFiles: ['/out/schematic.pdf'],
      duration: 100,
    });
    expect(result.filesPresent).toBe(true);
    expect(result.expectedFiles).toEqual(['/out/schematic.pdf']);
  });

  it('returns filesPresent false when no output files', () => {
    const result = validateExportResult({
      exitCode: 0,
      stdout: '',
      stderr: '',
      outputFiles: [],
      duration: 100,
    });
    expect(result.filesPresent).toBe(false);
  });

  it('returns filesPresent false when exit code is non-zero', () => {
    const result = validateExportResult({
      exitCode: 1,
      stdout: '',
      stderr: 'Export failed',
      outputFiles: ['/out/schematic.pdf'],
      duration: 100,
    });
    expect(result.filesPresent).toBe(false);
    expect(result.expectedFiles).toEqual(['/out/schematic.pdf']);
  });
});
