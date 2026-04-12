import { describe, it, expect } from 'vitest';
import {
  ProjectSchema,
  ProductSpecSchema,
  ArchitectureTemplateSchema,
  BOMSchema,
  BOMRowSchema,
  RoughQuoteSchema,
  AuditEntrySchema,
  IngestionManifestSchema,
  SufficiencyReportSchema,
} from '@raino/core';

const UUID = '00000000-0000-0000-0000-000000000001';
const now = new Date();

describe('Schema alignment: Prisma models vs Zod schemas', () => {
  describe('ProjectSchema', () => {
    it('parses a valid Prisma-shaped Project', () => {
      const prismaProject = {
        id: UUID,
        name: 'Test Project',
        description: 'A test project',
        status: 'intake',
        createdAt: now,
        updatedAt: now,
      };
      expect(ProjectSchema.safeParse(prismaProject).success).toBe(true);
    });

    it('rejects Project with missing required fields', () => {
      expect(ProjectSchema.safeParse({ id: UUID }).success).toBe(false);
    });

    it('rejects Project with empty name', () => {
      const result = ProjectSchema.safeParse({
        id: UUID,
        name: '',
        description: 'test',
        status: 'intake',
        createdAt: now,
        updatedAt: now,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ProductSpecSchema', () => {
    it('parses a valid spec shape matching Prisma Spec model JSON fields', () => {
      const specJson = {
        requirements: [
          { category: 'power', text: 'Must run on 5V USB', priority: 'must', resolved: false },
        ],
        constraints: { power: '5V USB', size: '50x50mm' },
        interfaces: [{ type: 'uart', protocol: 'RS232', speed: '115200' }],
      };
      expect(ProductSpecSchema.safeParse(specJson).success).toBe(true);
    });

    it('rejects spec with empty requirements', () => {
      const specJson = {
        requirements: [],
        constraints: {},
        interfaces: [],
      };
      expect(ProductSpecSchema.safeParse(specJson).success).toBe(false);
    });
  });

  describe('ArchitectureTemplateSchema', () => {
    it('parses a valid architecture matching Prisma Architecture model', () => {
      const arch = {
        id: UUID,
        name: 'ESP32-C3 Minimal',
        description: 'Minimal ESP32-C3 design',
        processorType: 'ESP32-C3',
        powerTopology: 'LDO',
        interfaceSet: ['UART', 'I2C', 'SPI'],
        referenceTopology: { mcu: 'center' },
        constraints: ['3.3V only'],
        requirements: ['WiFi'],
        approved: true,
      };
      expect(ArchitectureTemplateSchema.safeParse(arch).success).toBe(true);
    });
  });

  describe('BOMSchema', () => {
    it('parses a valid BOM matching Prisma BOM model shape', () => {
      const bom = {
        id: UUID,
        projectId: UUID,
        rows: [
          {
            reference: 'U1',
            value: 'ESP32-C3-MINI-1',
            symbol: 'RF_Module:ESP32-C3-MINI-1',
            footprint: 'RF_Module:ESP32-C3-MINI-1',
            manufacturer: 'Espressif',
            mpn: 'ESP32-C3-MINI-1-N4',
            lifecycle: 'active',
            alternates: [],
            dnp: false,
            provenance: { source: 'digikey', timestamp: now, confidence: 0.95 },
            riskLevel: 'low',
          },
        ],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      expect(BOMSchema.safeParse(bom).success).toBe(true);
    });

    it('rejects BOM with empty rows', () => {
      const bom = {
        id: UUID,
        projectId: UUID,
        rows: [],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      expect(BOMSchema.safeParse(bom).success).toBe(false);
    });
  });

  describe('BOMRowSchema', () => {
    it('parses a valid BOM row matching Prisma BOMRow model fields', () => {
      const row = {
        reference: 'R1',
        value: '10k',
        symbol: 'Device:R',
        footprint: 'Resistor_SMD:R_0402_1005Metric',
        manufacturer: 'Yageo',
        mpn: 'RC0402JR-0710KL',
        lifecycle: 'active',
        alternates: [],
        dnp: false,
        provenance: { source: 'mouser', timestamp: now, confidence: 0.8 },
        riskLevel: 'low',
      };
      expect(BOMRowSchema.safeParse(row).success).toBe(true);
    });
  });

  describe('RoughQuoteSchema', () => {
    it('parses a valid quote matching Prisma Quote model shape', () => {
      const quote = {
        projectId: UUID,
        bomId: UUID,
        designAutomationFee: 500,
        engineeringReviewFee: 300,
        pcbFabricationEstimate: 50,
        componentsEstimate: 200,
        assemblyEstimate: 100,
        qaPackagingHandling: 150,
        contingency: 130,
        margin: 214.5,
        lowQuote: 1200,
        midQuote: 1500,
        highQuote: 1875,
        confidenceLevel: 'medium',
        assumptions: ['Fixture pricing used for 30% of components'],
        includedScope: ['PCB fabrication', 'Assembly'],
        nextRecommendedAction: 'Review BOM alternates',
        isEstimate: true,
      };
      expect(RoughQuoteSchema.safeParse(quote).success).toBe(true);
    });

    it('rejects quote with negative fee', () => {
      const quote = {
        projectId: UUID,
        bomId: UUID,
        designAutomationFee: -100,
        engineeringReviewFee: 300,
        pcbFabricationEstimate: 50,
        componentsEstimate: 200,
        assemblyEstimate: 100,
        qaPackagingHandling: 150,
        contingency: 130,
        margin: 214.5,
        lowQuote: 1200,
        midQuote: 1500,
        highQuote: 1875,
        confidenceLevel: 'medium',
        assumptions: [],
        includedScope: [],
        nextRecommendedAction: 'Review',
        isEstimate: true,
      };
      expect(RoughQuoteSchema.safeParse(quote).success).toBe(false);
    });
  });

  describe('AuditEntrySchema', () => {
    it('parses a valid audit entry matching Prisma AuditEntry model', () => {
      const entry = {
        id: UUID,
        projectId: UUID,
        timestamp: now,
        category: 'bom',
        action: 'part_selected',
        details: { mpn: 'ESP32-C3-MINI-1' },
        source: 'supplier-adapter',
        actor: 'system',
      };
      expect(AuditEntrySchema.safeParse(entry).success).toBe(true);
    });

    it('rejects audit entry with invalid category', () => {
      const entry = {
        id: UUID,
        projectId: UUID,
        timestamp: now,
        category: 'invalid_category',
        action: 'test',
        details: {},
        source: 'test',
        actor: 'test',
      };
      expect(AuditEntrySchema.safeParse(entry).success).toBe(false);
    });
  });

  describe('IngestionManifestSchema', () => {
    it('parses a valid ingestion manifest matching Prisma IngestionManifest model', () => {
      const manifest = {
        runId: UUID,
        seedScope: 'ESP32-C3',
        families: [
          {
            family: 'ESP32-C3',
            manufacturer: 'Espressif',
            mpns: ['ESP32-C3-MINI-1-N4'],
            documentTypes: ['datasheet' as const],
          },
        ],
        stages: [
          {
            name: 'fetch_datasheets',
            status: 'completed' as const,
            startedAt: now,
            completedAt: now,
          },
        ],
        timestamps: {
          queuedAt: now,
          startedAt: now,
          completedAt: now,
        },
        status: 'completed',
      };
      expect(IngestionManifestSchema.safeParse(manifest).success).toBe(true);
    });

    it('rejects manifest with empty families', () => {
      const manifest = {
        runId: UUID,
        seedScope: 'ESP32-C3',
        families: [],
        stages: [],
        timestamps: { queuedAt: now },
        status: 'queued',
      };
      expect(IngestionManifestSchema.safeParse(manifest).success).toBe(false);
    });
  });

  describe('SufficiencyReportSchema', () => {
    it('parses a valid sufficiency report', () => {
      const report = {
        projectId: UUID,
        candidateId: 'esp32-c3',
        checks: [
          { name: 'datasheet_exists', description: 'Datasheet exists', passed: true },
          {
            name: 'errata_available',
            description: 'Errata is available',
            passed: false,
            details: 'No errata published',
          },
        ],
        overallPass: false,
        gaps: ['Missing errata for ESP32-C3'],
      };
      expect(SufficiencyReportSchema.safeParse(report).success).toBe(true);
    });
  });
});
