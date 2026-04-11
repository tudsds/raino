import { describe, it, expect } from 'vitest';
import { ProjectSchema, ProjectStatus } from '../schemas/project.js';
import {
  ProductSpecSchema,
  RequirementSchema,
  ConstraintsSchema,
  InterfaceSchema,
} from '../schemas/spec.js';
import {
  BOMRowSchema,
  BOMSchema,
  ProvenanceSchema,
  RiskLevel,
  LifecycleStatus,
} from '../schemas/bom.js';
import { RoughQuoteSchema, ConfidenceLevel } from '../schemas/quote.js';
import { AuditEntrySchema, AuditManifestSchema, AuditCategory } from '../schemas/audit.js';
import {
  CandidateFamilySchema,
  IngestionManifestSchema,
  IngestionStageSchema,
  SufficiencyReportSchema,
  SufficiencyCheckSchema,
  DocumentType,
  IngestionManifestStatus,
} from '../schemas/ingestion.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';

function makeProvenance() {
  return {
    source: 'DigiKey',
    timestamp: new Date(),
    confidence: 0.95,
  };
}

// ── ProjectSchema ────────────────────────────────────────────────────────────

describe('ProjectSchema', () => {
  it('parses a valid project', () => {
    const result = ProjectSchema.parse({
      id: VALID_UUID,
      name: 'Test Project',
      description: 'A test PCB project',
      status: 'intake',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.name).toBe('Test Project');
    expect(result.status).toBe('intake');
  });

  it('parses a project with optional fields', () => {
    const result = ProjectSchema.parse({
      id: VALID_UUID,
      name: 'Test Project',
      description: 'A test project',
      status: 'intake',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
      metadata: { foo: 'bar' },
    });
    expect(result.userId).toBe('user-123');
    expect(result.metadata).toEqual({ foo: 'bar' });
  });

  it('rejects project without required fields', () => {
    expect(() => ProjectSchema.parse({})).toThrow();
  });

  it('rejects project missing name', () => {
    expect(() =>
      ProjectSchema.parse({
        id: VALID_UUID,
        description: 'test',
        status: 'intake',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() =>
      ProjectSchema.parse({
        id: VALID_UUID,
        name: 'Test',
        description: 'Test',
        status: 'invalid_status',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it('rejects invalid UUID', () => {
    expect(() =>
      ProjectSchema.parse({
        id: 'not-a-uuid',
        name: 'Test',
        description: 'Test',
        status: 'intake',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it('rejects empty name', () => {
    expect(() =>
      ProjectSchema.parse({
        id: VALID_UUID,
        name: '',
        description: 'Test',
        status: 'intake',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it('rejects name exceeding 200 chars', () => {
    expect(() =>
      ProjectSchema.parse({
        id: VALID_UUID,
        name: 'x'.repeat(201),
        description: 'Test',
        status: 'intake',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it('rejects empty description', () => {
    expect(() =>
      ProjectSchema.parse({
        id: VALID_UUID,
        name: 'Test',
        description: '',
        status: 'intake',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it('accepts all valid ProjectStatus values', () => {
    const statuses = ProjectStatus.options;
    for (const status of statuses) {
      const result = ProjectSchema.parse({
        id: VALID_UUID,
        name: 'Test',
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.status).toBe(status);
    }
  });
});

// ── ProductSpecSchema ────────────────────────────────────────────────────────

describe('ProductSpecSchema', () => {
  const validSpec = {
    requirements: [
      { category: 'power', text: 'Must support USB-C PD', priority: 'must', resolved: false },
    ],
    constraints: {},
    interfaces: [{ type: 'USB', protocol: 'USB 2.0' }],
    targetVolume: 1000,
    targetCost: 50,
    targetTimeline: '3 months',
    region: 'US',
    certifications: ['FCC', 'CE'],
  };

  it('parses a valid product spec', () => {
    const result = ProductSpecSchema.parse(validSpec);
    expect(result.requirements).toHaveLength(1);
    expect(result.targetVolume).toBe(1000);
  });

  it('parses a spec with minimal fields', () => {
    const result = ProductSpecSchema.parse({
      requirements: [
        { category: 'mcu', text: 'Need ARM Cortex-M4', priority: 'should', resolved: true },
      ],
      constraints: {},
      interfaces: [],
    });
    expect(result.requirements).toHaveLength(1);
  });

  it('rejects spec with empty requirements', () => {
    expect(() =>
      ProductSpecSchema.parse({
        requirements: [],
        constraints: {},
        interfaces: [],
      }),
    ).toThrow();
  });

  it('rejects spec without required fields', () => {
    expect(() => ProductSpecSchema.parse({})).toThrow();
  });

  it('rejects negative targetVolume', () => {
    expect(() =>
      ProductSpecSchema.parse({
        ...validSpec,
        targetVolume: -100,
      }),
    ).toThrow();
  });

  it('rejects zero targetVolume', () => {
    expect(() =>
      ProductSpecSchema.parse({
        ...validSpec,
        targetVolume: 0,
      }),
    ).toThrow();
  });

  it('rejects negative targetCost', () => {
    expect(() =>
      ProductSpecSchema.parse({
        ...validSpec,
        targetCost: -10,
      }),
    ).toThrow();
  });

  it('rejects invalid priority', () => {
    expect(() =>
      ProductSpecSchema.parse({
        requirements: [{ category: 'mcu', text: 'Test', priority: 'critical', resolved: false }],
        constraints: {},
        interfaces: [],
      }),
    ).toThrow();
  });
});

describe('RequirementSchema', () => {
  it('parses a valid requirement', () => {
    const result = RequirementSchema.parse({
      category: 'power',
      text: 'Must support 5V input',
      priority: 'must',
      resolved: false,
    });
    expect(result.category).toBe('power');
  });

  it('rejects empty category', () => {
    expect(() =>
      RequirementSchema.parse({
        category: '',
        text: 'Test',
        priority: 'must',
        resolved: false,
      }),
    ).toThrow();
  });

  it('rejects empty text', () => {
    expect(() =>
      RequirementSchema.parse({
        category: 'power',
        text: '',
        priority: 'must',
        resolved: false,
      }),
    ).toThrow();
  });
});

describe('ConstraintsSchema', () => {
  it('parses empty constraints', () => {
    const result = ConstraintsSchema.parse({});
    expect(result.power).toBeUndefined();
  });

  it('parses constraints with all fields', () => {
    const result = ConstraintsSchema.parse({
      power: '5V USB',
      size: '50x50mm',
      cost: '< $20',
      environment: '-40 to 85°C',
      manufacturing: 'JLCPCB assembly',
    });
    expect(result.power).toBe('5V USB');
    expect(result.size).toBe('50x50mm');
  });
});

describe('InterfaceSchema', () => {
  it('parses a valid interface', () => {
    const result = InterfaceSchema.parse({
      type: 'USB',
      protocol: 'USB 2.0',
      speed: '480 Mbps',
      notes: 'Host mode',
    });
    expect(result.type).toBe('USB');
    expect(result.speed).toBe('480 Mbps');
  });

  it('rejects interface without required fields', () => {
    expect(() => InterfaceSchema.parse({})).toThrow();
  });
});

// ── BOM Schemas ──────────────────────────────────────────────────────────────

describe('BOMRowSchema', () => {
  const validBOMRow = {
    reference: 'U1',
    value: 'STM32F407VGT6',
    symbol: 'MCU_ST_STM32F407',
    footprint: 'LQFP-100',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    lifecycle: 'active',
    stock: 1000,
    unitPrice: 12.5,
    moq: 1,
    alternates: ['STM32F407VGT7'],
    dnp: false,
    provenance: makeProvenance(),
    riskLevel: 'low',
  };

  it('parses a valid BOM row', () => {
    const result = BOMRowSchema.parse(validBOMRow);
    expect(result.reference).toBe('U1');
    expect(result.unitPrice).toBe(12.5);
    expect(result.dnp).toBe(false);
  });

  it('parses a BOM row with minimal fields', () => {
    const result = BOMRowSchema.parse({
      reference: 'R1',
      value: '10K',
      symbol: 'Resistor',
      footprint: '0402',
      manufacturer: 'Yageo',
      mpn: 'RC0402FR-0710KL',
      lifecycle: 'active',
      alternates: [],
      dnp: false,
      provenance: makeProvenance(),
      riskLevel: 'low',
    });
    expect(result.distributor).toBeUndefined();
    expect(result.unitPrice).toBeUndefined();
  });

  it('rejects BOM row without required fields', () => {
    expect(() => BOMRowSchema.parse({})).toThrow();
  });

  it('rejects empty reference', () => {
    expect(() => BOMRowSchema.parse({ ...validBOMRow, reference: '' })).toThrow();
  });

  it('rejects negative stock', () => {
    expect(() => BOMRowSchema.parse({ ...validBOMRow, stock: -1 })).toThrow();
  });

  it('rejects negative unitPrice', () => {
    expect(() => BOMRowSchema.parse({ ...validBOMRow, unitPrice: -5 })).toThrow();
  });

  it('rejects zero moq', () => {
    expect(() => BOMRowSchema.parse({ ...validBOMRow, moq: 0 })).toThrow();
  });

  it('rejects invalid lifecycle', () => {
    expect(() => BOMRowSchema.parse({ ...validBOMRow, lifecycle: 'invalid' })).toThrow();
  });

  it('rejects invalid riskLevel', () => {
    expect(() => BOMRowSchema.parse({ ...validBOMRow, riskLevel: 'critical' })).toThrow();
  });

  it('rejects invalid provenance confidence below 0', () => {
    expect(() =>
      BOMRowSchema.parse({
        ...validBOMRow,
        provenance: { source: 'test', timestamp: new Date(), confidence: -0.1 },
      }),
    ).toThrow();
  });

  it('rejects invalid provenance confidence above 1', () => {
    expect(() =>
      BOMRowSchema.parse({
        ...validBOMRow,
        provenance: { source: 'test', timestamp: new Date(), confidence: 1.1 },
      }),
    ).toThrow();
  });

  it('accepts all valid lifecycle values', () => {
    const lifecycles: string[] = LifecycleStatus.options;
    for (const lc of lifecycles) {
      const result = BOMRowSchema.parse({ ...validBOMRow, lifecycle: lc });
      expect(result.lifecycle).toBe(lc);
    }
  });

  it('accepts all valid risk level values', () => {
    const levels: string[] = RiskLevel.options;
    for (const level of levels) {
      const result = BOMRowSchema.parse({ ...validBOMRow, riskLevel: level });
      expect(result.riskLevel).toBe(level);
    }
  });
});

describe('BOMSchema', () => {
  const validBOMRow = {
    reference: 'U1',
    value: 'STM32F407VGT6',
    symbol: 'MCU_ST_STM32F407',
    footprint: 'LQFP-100',
    manufacturer: 'STMicroelectronics',
    mpn: 'STM32F407VGT6',
    lifecycle: 'active',
    alternates: [],
    dnp: false,
    provenance: makeProvenance(),
    riskLevel: 'low',
  };

  it('parses a valid BOM', () => {
    const result = BOMSchema.parse({
      id: VALID_UUID,
      projectId: VALID_UUID_2,
      rows: [validBOMRow],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });
    expect(result.rows).toHaveLength(1);
    expect(result.version).toBe(1);
  });

  it('rejects BOM with empty rows', () => {
    expect(() =>
      BOMSchema.parse({
        id: VALID_UUID,
        projectId: VALID_UUID_2,
        rows: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }),
    ).toThrow();
  });

  it('rejects BOM without required fields', () => {
    expect(() => BOMSchema.parse({})).toThrow();
  });

  it('rejects version 0', () => {
    expect(() =>
      BOMSchema.parse({
        id: VALID_UUID,
        projectId: VALID_UUID_2,
        rows: [validBOMRow],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      }),
    ).toThrow();
  });

  it('rejects negative version', () => {
    expect(() =>
      BOMSchema.parse({
        id: VALID_UUID,
        projectId: VALID_UUID_2,
        rows: [validBOMRow],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: -1,
      }),
    ).toThrow();
  });
});

describe('ProvenanceSchema', () => {
  it('parses valid provenance', () => {
    const result = ProvenanceSchema.parse({
      source: 'DigiKey API',
      timestamp: new Date(),
      confidence: 0.9,
    });
    expect(result.source).toBe('DigiKey API');
    expect(result.confidence).toBe(0.9);
  });

  it('accepts confidence at boundary 0', () => {
    const result = ProvenanceSchema.parse({
      source: 'test',
      timestamp: new Date(),
      confidence: 0,
    });
    expect(result.confidence).toBe(0);
  });

  it('accepts confidence at boundary 1', () => {
    const result = ProvenanceSchema.parse({
      source: 'test',
      timestamp: new Date(),
      confidence: 1,
    });
    expect(result.confidence).toBe(1);
  });

  it('rejects without source', () => {
    expect(() => ProvenanceSchema.parse({ timestamp: new Date(), confidence: 0.5 })).toThrow();
  });
});

// ── Quote Schema ─────────────────────────────────────────────────────────────

describe('RoughQuoteSchema', () => {
  const validQuote = {
    projectId: VALID_UUID,
    bomId: VALID_UUID_2,
    designAutomationFee: 500,
    engineeringReviewFee: 300,
    pcbFabricationEstimate: 50,
    componentsEstimate: 100,
    assemblyEstimate: 25,
    qaPackagingHandling: 15,
    contingency: 99,
    margin: 152.85,
    lowQuote: 800,
    midQuote: 1141.85,
    highQuote: 1200,
    confidenceLevel: 'medium',
    assumptions: ['Test assumption'],
    includedScope: ['PCB fabrication'],
    nextRecommendedAction: 'Review quote',
    isEstimate: true,
  };

  it('parses a valid quote', () => {
    const result = RoughQuoteSchema.parse(validQuote);
    expect(result.projectId).toBe(VALID_UUID);
    expect(result.confidenceLevel).toBe('medium');
  });

  it('rejects quote without required fields', () => {
    expect(() => RoughQuoteSchema.parse({})).toThrow();
  });

  it('rejects negative designAutomationFee', () => {
    expect(() => RoughQuoteSchema.parse({ ...validQuote, designAutomationFee: -1 })).toThrow();
  });

  it('rejects negative lowQuote', () => {
    expect(() => RoughQuoteSchema.parse({ ...validQuote, lowQuote: -1 })).toThrow();
  });

  it('rejects invalid confidenceLevel', () => {
    expect(() => RoughQuoteSchema.parse({ ...validQuote, confidenceLevel: 'ultra' })).toThrow();
  });

  it('accepts all valid confidence levels', () => {
    for (const level of ConfidenceLevel.options) {
      const result = RoughQuoteSchema.parse({ ...validQuote, confidenceLevel: level });
      expect(result.confidenceLevel).toBe(level);
    }
  });
});

// ── Audit Schemas ────────────────────────────────────────────────────────────

describe('AuditEntrySchema', () => {
  const validEntry = {
    id: VALID_UUID,
    projectId: VALID_UUID_2,
    timestamp: new Date(),
    category: 'bom',
    action: 'component_selected',
    details: { mpn: 'STM32F407VGT6' },
    source: 'agent',
    actor: 'system',
  };

  it('parses a valid audit entry', () => {
    const result = AuditEntrySchema.parse(validEntry);
    expect(result.action).toBe('component_selected');
    expect(result.category).toBe('bom');
  });

  it('rejects audit entry without required fields', () => {
    expect(() => AuditEntrySchema.parse({})).toThrow();
  });

  it('rejects invalid category', () => {
    expect(() => AuditEntrySchema.parse({ ...validEntry, category: 'invalid' })).toThrow();
  });

  it('accepts all valid audit categories', () => {
    for (const cat of AuditCategory.options) {
      const result = AuditEntrySchema.parse({ ...validEntry, category: cat });
      expect(result.category).toBe(cat);
    }
  });

  it('rejects empty action', () => {
    expect(() => AuditEntrySchema.parse({ ...validEntry, action: '' })).toThrow();
  });

  it('rejects empty source', () => {
    expect(() => AuditEntrySchema.parse({ ...validEntry, source: '' })).toThrow();
  });
});

describe('AuditManifestSchema', () => {
  it('parses a valid manifest', () => {
    const result = AuditManifestSchema.parse({
      id: VALID_UUID,
      projectId: VALID_UUID_2,
      entries: [],
      generatedAt: new Date(),
      version: 1,
    });
    expect(result.entries).toHaveLength(0);
  });

  it('rejects manifest without required fields', () => {
    expect(() => AuditManifestSchema.parse({})).toThrow();
  });
});

// ── Ingestion Schemas ────────────────────────────────────────────────────────

describe('CandidateFamilySchema', () => {
  it('parses a valid candidate family', () => {
    const result = CandidateFamilySchema.parse({
      family: 'STM32F4',
      manufacturer: 'STMicroelectronics',
      mpns: ['STM32F407VGT6', 'STM32F407VET6'],
      documentTypes: ['datasheet', 'errata'],
    });
    expect(result.mpns).toHaveLength(2);
  });

  it('rejects without required fields', () => {
    expect(() => CandidateFamilySchema.parse({})).toThrow();
  });

  it('rejects empty mpns array', () => {
    expect(() =>
      CandidateFamilySchema.parse({
        family: 'STM32F4',
        manufacturer: 'STMicroelectronics',
        mpns: [],
        documentTypes: [],
      }),
    ).toThrow();
  });

  it('rejects empty mpn string in array', () => {
    expect(() =>
      CandidateFamilySchema.parse({
        family: 'STM32F4',
        manufacturer: 'STMicroelectronics',
        mpns: [''],
        documentTypes: [],
      }),
    ).toThrow();
  });

  it('rejects invalid documentType', () => {
    expect(() =>
      CandidateFamilySchema.parse({
        family: 'STM32F4',
        manufacturer: 'ST',
        mpns: ['STM32F407'],
        documentTypes: ['invalid_type'],
      }),
    ).toThrow();
  });

  it('accepts all valid document types', () => {
    for (const dt of DocumentType.options) {
      const result = CandidateFamilySchema.parse({
        family: 'STM32F4',
        manufacturer: 'ST',
        mpns: ['STM32F407'],
        documentTypes: [dt],
      });
      expect(result.documentTypes).toContain(dt);
    }
  });
});

describe('IngestionStageSchema', () => {
  it('parses a valid ingestion stage', () => {
    const result = IngestionStageSchema.parse({
      name: 'fetch_datasheets',
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
    });
    expect(result.status).toBe('completed');
  });

  it('parses with minimal fields', () => {
    const result = IngestionStageSchema.parse({
      name: 'fetch_datasheets',
      status: 'pending',
    });
    expect(result.startedAt).toBeUndefined();
  });

  it('rejects invalid status', () => {
    expect(() => IngestionStageSchema.parse({ name: 'test', status: 'running' })).toThrow();
  });
});

describe('IngestionManifestSchema', () => {
  const validManifest = {
    runId: VALID_UUID,
    seedScope: 'STM32F407',
    families: [
      {
        family: 'STM32F4',
        manufacturer: 'STMicroelectronics',
        mpns: ['STM32F407VGT6'],
        documentTypes: ['datasheet'],
      },
    ],
    stages: [{ name: 'fetch', status: 'completed' as const }],
    timestamps: { queuedAt: new Date() },
    status: 'queued' as const,
  };

  it('parses a valid ingestion manifest', () => {
    const result = IngestionManifestSchema.parse(validManifest);
    expect(result.families).toHaveLength(1);
    expect(result.status).toBe('queued');
  });

  it('rejects without required fields', () => {
    expect(() => IngestionManifestSchema.parse({})).toThrow();
  });

  it('rejects empty families', () => {
    expect(() => IngestionManifestSchema.parse({ ...validManifest, families: [] })).toThrow();
  });

  it('rejects invalid manifest status', () => {
    expect(() => IngestionManifestSchema.parse({ ...validManifest, status: 'unknown' })).toThrow();
  });

  it('accepts all valid manifest statuses', () => {
    for (const status of IngestionManifestStatus.options) {
      const result = IngestionManifestSchema.parse({ ...validManifest, status });
      expect(result.status).toBe(status);
    }
  });
});

describe('SufficiencyCheckSchema', () => {
  it('parses a passing check', () => {
    const result = SufficiencyCheckSchema.parse({
      name: 'datasheet_exists',
      description: 'Datasheet must exist',
      passed: true,
    });
    expect(result.passed).toBe(true);
  });

  it('parses a failing check with details', () => {
    const result = SufficiencyCheckSchema.parse({
      name: 'errata_exists',
      description: 'Errata should exist',
      passed: false,
      details: 'No errata document found',
    });
    expect(result.details).toBe('No errata document found');
  });

  it('rejects without required fields', () => {
    expect(() => SufficiencyCheckSchema.parse({})).toThrow();
  });
});

describe('SufficiencyReportSchema', () => {
  it('parses a valid report', () => {
    const result = SufficiencyReportSchema.parse({
      projectId: VALID_UUID,
      candidateId: 'STM32F407VGT6',
      checks: [
        { name: 'datasheet', description: 'Datasheet exists', passed: true },
        { name: 'errata', description: 'Errata exists', passed: false, details: 'Missing' },
      ],
      overallPass: false,
      gaps: ['errata'],
    });
    expect(result.overallPass).toBe(false);
    expect(result.gaps).toHaveLength(1);
  });

  it('rejects report with empty checks', () => {
    expect(() =>
      SufficiencyReportSchema.parse({
        projectId: VALID_UUID,
        candidateId: 'test',
        checks: [],
        overallPass: true,
        gaps: [],
      }),
    ).toThrow();
  });

  it('rejects without required fields', () => {
    expect(() => SufficiencyReportSchema.parse({})).toThrow();
  });
});
