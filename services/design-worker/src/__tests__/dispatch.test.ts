import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pollAndExecuteWithPrisma } from '../queue/worker';

interface MockDesignJob {
  id: string;
  projectId: string;
  jobType: string;
  status: string;
  progress: unknown;
  result: Record<string, unknown> | null;
  error: string | null;
  workerId: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

function makeDesignJob(overrides: Partial<MockDesignJob> = {}): MockDesignJob {
  return {
    id: overrides.id ?? 'job-1',
    projectId: overrides.projectId ?? 'project-1',
    jobType: overrides.jobType ?? 'generate',
    status: overrides.status ?? 'pending',
    progress: overrides.progress ?? 0,
    result: overrides.result ?? null,
    error: overrides.error ?? null,
    workerId: overrides.workerId ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    startedAt: overrides.startedAt ?? null,
    completedAt: overrides.completedAt ?? null,
  };
}

const mockPrisma = {
  designJob: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  designArtifact: {
    create: vi.fn(),
  },
};

vi.mock('@raino/db', () => ({
  prisma: mockPrisma,
}));

vi.mock('../generator/project.js', () => ({
  generateKiCadProject: vi.fn(),
}));

import { generateKiCadProject } from '../generator/project';

describe('pollAndExecuteWithPrisma', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when no pending jobs exist', async () => {
    mockPrisma.designJob.findFirst.mockResolvedValue(null);

    await pollAndExecuteWithPrisma();

    expect(mockPrisma.designJob.findFirst).toHaveBeenCalledOnce();
    expect(mockPrisma.designJob.update).not.toHaveBeenCalled();
  });

  it('transitions job from pending to running to completed for successful generate', async () => {
    const job = makeDesignJob({
      id: 'job-success',
      projectId: 'proj-1',
      jobType: 'generate',
      result: {
        type: 'generate',
        projectId: 'proj-1',
        generateRequest: {
          projectId: 'proj-1',
          projectName: 'TestProject',
          bom: [
            {
              reference: 'U1',
              value: 'STM32',
              mpn: 'STM32F407',
              footprint: 'QFP',
              symbol: 'MCU',
              manufacturer: 'ST',
              quantity: 1,
            },
          ],
          architecture: {
            name: 'test',
            processorType: 'arm',
            powerTopology: 'buck',
            interfaceSet: [],
            referenceTopology: {},
          },
        },
      },
    });

    mockPrisma.designJob.findFirst.mockResolvedValue(job);
    mockPrisma.designJob.update.mockResolvedValue({});

    vi.mocked(generateKiCadProject).mockReturnValue({
      projectId: 'proj-1',
      success: true,
      projectPath: '/tmp/raino-projects/proj-1',
      schematicPath: '/tmp/raino-projects/proj-1/TestProject.kicad_sch',
      pcbPath: '/tmp/raino-projects/proj-1/TestProject.kicad_pcb',
      errors: [],
      warnings: [],
      duration: 42,
    });

    await pollAndExecuteWithPrisma();

    expect(mockPrisma.designJob.findFirst).toHaveBeenCalledOnce();
    expect(mockPrisma.designJob.update).toHaveBeenCalledTimes(2);

    const firstUpdate = mockPrisma.designJob.update.mock.calls[0]![0] as {
      where: { id: string };
      data: Record<string, unknown>;
    };
    expect(firstUpdate.where.id).toBe('job-success');
    expect(firstUpdate.data.status).toBe('running');
    expect(firstUpdate.data.startedAt).toBeInstanceOf(Date);

    const secondUpdate = mockPrisma.designJob.update.mock.calls[1]![0] as {
      where: { id: string };
      data: Record<string, unknown>;
    };
    expect(secondUpdate.where.id).toBe('job-success');
    expect(secondUpdate.data.status).toBe('completed');
    expect(secondUpdate.data.progress).toBe(100);
    expect(secondUpdate.data.error).toBeNull();
    expect(secondUpdate.data.completedAt).toBeInstanceOf(Date);
  });

  it('transitions job from pending to running to failed when generation returns errors', async () => {
    const job = makeDesignJob({
      id: 'job-fail',
      projectId: 'proj-2',
      jobType: 'generate',
      result: {
        type: 'generate',
        projectId: 'proj-2',
        generateRequest: {
          projectId: 'proj-2',
          projectName: 'BadProject',
          bom: [],
          architecture: {
            name: 'test',
            processorType: 'arm',
            powerTopology: 'buck',
            interfaceSet: [],
            referenceTopology: {},
          },
        },
      },
    });

    mockPrisma.designJob.findFirst.mockResolvedValue(job);
    mockPrisma.designJob.update.mockResolvedValue({});

    vi.mocked(generateKiCadProject).mockReturnValue({
      projectId: 'proj-2',
      success: false,
      errors: ['BOM must contain at least one component'],
      warnings: [],
      duration: 10,
    });

    await pollAndExecuteWithPrisma();

    expect(mockPrisma.designJob.update).toHaveBeenCalledTimes(2);

    const secondUpdate = mockPrisma.designJob.update.mock.calls[1]![0] as {
      where: { id: string };
      data: Record<string, unknown>;
    };
    expect(secondUpdate.data.status).toBe('failed');
    expect(secondUpdate.data.error).toContain('BOM must contain at least one component');
  });

  it('transitions job from pending to running to failed when generation throws', async () => {
    const job = makeDesignJob({
      id: 'job-throw',
      projectId: 'proj-3',
      jobType: 'generate',
      result: {
        type: 'generate',
        projectId: 'proj-3',
        generateRequest: {
          projectId: 'proj-3',
          projectName: 'ThrowProject',
          bom: [
            {
              reference: 'U1',
              value: 'STM32',
              mpn: 'STM32F407',
              footprint: 'QFP',
              symbol: 'MCU',
              manufacturer: 'ST',
              quantity: 1,
            },
          ],
          architecture: {
            name: 'test',
            processorType: 'arm',
            powerTopology: 'buck',
            interfaceSet: [],
            referenceTopology: {},
          },
        },
      },
    });

    mockPrisma.designJob.findFirst.mockResolvedValue(job);
    mockPrisma.designJob.update.mockResolvedValue({});

    vi.mocked(generateKiCadProject).mockImplementation(() => {
      throw new Error('KiCad generator crashed unexpectedly');
    });

    await pollAndExecuteWithPrisma();

    expect(mockPrisma.designJob.update).toHaveBeenCalledTimes(2);

    const secondUpdate = mockPrisma.designJob.update.mock.calls[1]![0] as {
      where: { id: string };
      data: Record<string, unknown>;
    };
    expect(secondUpdate.data.status).toBe('failed');
    expect(secondUpdate.data.error).toBe('KiCad generator crashed unexpectedly');
  });

  it('handles validate job lifecycle successfully', async () => {
    const job = makeDesignJob({
      id: 'job-validate',
      projectId: 'proj-4',
      jobType: 'validate',
      result: {
        type: 'validate',
        projectId: 'proj-4',
        projectPath: '/tmp/raino-projects/proj-4',
      },
    });

    mockPrisma.designJob.findFirst.mockResolvedValue(job);
    mockPrisma.designJob.update.mockResolvedValue({});

    vi.mock('../validator/engine.js', () => ({
      runValidationAsync: vi.fn().mockResolvedValue([
        { check: 'erc', passed: true, violations: [] },
        { check: 'drc', passed: true, violations: [] },
      ]),
    }));

    const { runValidationAsync } = await import('../validator/engine.js');
    vi.mocked(runValidationAsync).mockResolvedValue([
      { projectId: 'proj-4', checkType: 'erc', passed: true, violations: [], duration: 5 },
      { projectId: 'proj-4', checkType: 'drc', passed: true, violations: [], duration: 5 },
    ]);

    await pollAndExecuteWithPrisma();

    const secondUpdate = mockPrisma.designJob.update.mock.calls[1]![0] as {
      where: { id: string };
      data: Record<string, unknown>;
    };
    expect(secondUpdate.data.status).toBe('completed');
  });

  it('handles validate job lifecycle with failures', async () => {
    const job = makeDesignJob({
      id: 'job-validate-fail',
      projectId: 'proj-5',
      jobType: 'validate',
      result: {
        type: 'validate',
        projectId: 'proj-5',
        projectPath: '/tmp/raino-projects/proj-5',
      },
    });

    mockPrisma.designJob.findFirst.mockResolvedValue(job);
    mockPrisma.designJob.update.mockResolvedValue({});

    const { runValidationAsync } = await import('../validator/engine.js');
    vi.mocked(runValidationAsync).mockResolvedValue([
      {
        projectId: 'proj-5',
        checkType: 'erc',
        passed: false,
        violations: [
          { type: 'error', category: 'connectivity', message: 'Unconnected pin', severity: 1 },
        ],
        duration: 5,
      },
      { projectId: 'proj-5', checkType: 'drc', passed: true, violations: [], duration: 5 },
    ]);

    await pollAndExecuteWithPrisma();

    const secondUpdate = mockPrisma.designJob.update.mock.calls[1]![0] as {
      where: { id: string };
      data: Record<string, unknown>;
    };
    expect(secondUpdate.data.status).toBe('failed');
    expect(secondUpdate.data.error).toContain('Unconnected pin');
  });

  it('queries pending jobs ordered by creation time', async () => {
    mockPrisma.designJob.findFirst.mockResolvedValue(null);

    await pollAndExecuteWithPrisma();

    expect(mockPrisma.designJob.findFirst).toHaveBeenCalledWith({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
  });
});
