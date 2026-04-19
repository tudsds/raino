import { describe, it, expect } from 'vitest';
import { InMemoryAuditTraceStore, type AuditTrace } from '../traces/logger';
import { validatePolicies, type ProjectState } from '../policy/checker';
import { generateManifest, type ArtifactEntryInput } from '../manifests/generator';
import { generateAuditReport, type BOMProvenanceEntry } from '../reports/generator';

function makeTrace(overrides: Partial<AuditTrace> = {}): AuditTrace {
  return {
    id: overrides.id ?? 'trace-1',
    projectId: overrides.projectId ?? 'project-1',
    timestamp: overrides.timestamp ?? Date.now(),
    category: overrides.category ?? 'spec',
    action: overrides.action ?? 'spec_created',
    actor: overrides.actor ?? 'system',
    details: overrides.details ?? {},
    source: overrides.source ?? 'agent',
    duration: overrides.duration,
  };
}

function makeArtifactEntry(overrides: Partial<ArtifactEntryInput> = {}): ArtifactEntryInput {
  return {
    type: overrides.type ?? 'schematic',
    filename: overrides.filename ?? 'schematic.svg',
    path: overrides.path ?? '/output/schematic.svg',
    generatedAt: overrides.generatedAt ?? Date.now(),
    source: overrides.source ?? 'design-worker',
    metadata: overrides.metadata ?? {},
  };
}

// ── InMemoryAuditTraceStore ──────────────────────────────────────────────────

describe('InMemoryAuditTraceStore', () => {
  it('appends and retrieves a trace', async () => {
    const store = new InMemoryAuditTraceStore();
    const trace = makeTrace();
    await store.append(trace);

    const retrieved = await store.getTrace('trace-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.action).toBe('spec_created');
  });

  it('returns null for non-existent trace', async () => {
    const store = new InMemoryAuditTraceStore();
    const result = await store.getTrace('nonexistent');
    expect(result).toBeNull();
  });

  it('queries traces by projectId', async () => {
    const store = new InMemoryAuditTraceStore();
    await store.append(makeTrace({ id: 't1', projectId: 'proj-A' }));
    await store.append(makeTrace({ id: 't2', projectId: 'proj-A' }));
    await store.append(makeTrace({ id: 't3', projectId: 'proj-B' }));

    const results = await store.query('proj-A');
    expect(results).toHaveLength(2);
  });

  it('returns empty array for unknown projectId', async () => {
    const store = new InMemoryAuditTraceStore();
    const results = await store.query('nonexistent');
    expect(results).toHaveLength(0);
  });

  it('filters by category', async () => {
    const store = new InMemoryAuditTraceStore();
    await store.append(makeTrace({ id: 't1', projectId: 'p1', category: 'spec' }));
    await store.append(makeTrace({ id: 't2', projectId: 'p1', category: 'bom' }));

    const results = await store.query('p1', { category: 'spec' });
    expect(results).toHaveLength(1);
    expect(results[0]!.category).toBe('spec');
  });

  it('filters by time range', async () => {
    const store = new InMemoryAuditTraceStore();
    const now = Date.now();
    await store.append(makeTrace({ id: 't1', projectId: 'p1', timestamp: now - 2000 }));
    await store.append(makeTrace({ id: 't2', projectId: 'p1', timestamp: now - 1000 }));
    await store.append(makeTrace({ id: 't3', projectId: 'p1', timestamp: now }));

    const results = await store.query('p1', { from: now - 1500, to: now - 500 });
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('t2');
  });

  it('returns results sorted by timestamp ascending', async () => {
    const store = new InMemoryAuditTraceStore();
    const now = Date.now();
    await store.append(makeTrace({ id: 't1', projectId: 'p1', timestamp: now + 1000 }));
    await store.append(makeTrace({ id: 't2', projectId: 'p1', timestamp: now }));

    const results = await store.query('p1');
    expect(results[0]!.id).toBe('t2');
    expect(results[1]!.id).toBe('t1');
  });
});

// ── Policy Checker ───────────────────────────────────────────────────────────

describe('validatePolicies', () => {
  it('passes all checks for a complete valid project', () => {
    const state: ProjectState = {
      hasSpec: true,
      hasArchitecture: true,
      hasBOM: true,
      bomHasPlaceholders: false,
      hasDesign: true,
      designValidated: true,
      hasQuote: true,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    expect(checks.every((c) => c.passed)).toBe(true);
    expect(checks.every((c) => c.severity === 'info')).toBe(true);
  });

  it('fails spec-before-bom when BOM exists without spec', () => {
    const state: ProjectState = {
      hasSpec: false,
      hasArchitecture: false,
      hasBOM: true,
      bomHasPlaceholders: false,
      hasDesign: false,
      designValidated: false,
      hasQuote: false,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    const specCheck = checks.find((c) => c.name === 'spec-before-bom');
    expect(specCheck).toBeDefined();
    expect(specCheck!.passed).toBe(false);
    expect(specCheck!.severity).toBe('error');
  });

  it('fails architecture-before-design when design exists without architecture', () => {
    const state: ProjectState = {
      hasSpec: true,
      hasArchitecture: false,
      hasBOM: true,
      bomHasPlaceholders: false,
      hasDesign: true,
      designValidated: true,
      hasQuote: false,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    const archCheck = checks.find((c) => c.name === 'architecture-before-design');
    expect(archCheck).toBeDefined();
    expect(archCheck!.passed).toBe(false);
    expect(archCheck!.severity).toBe('error');
  });

  it('warns on BOM placeholders before design generation', () => {
    const state: ProjectState = {
      hasSpec: true,
      hasArchitecture: true,
      hasBOM: true,
      bomHasPlaceholders: true,
      hasDesign: true,
      designValidated: true,
      hasQuote: false,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    const placeholderCheck = checks.find((c) => c.name === 'bom-no-placeholders-before-design');
    expect(placeholderCheck).toBeDefined();
    expect(placeholderCheck!.passed).toBe(false);
    expect(placeholderCheck!.severity).toBe('warning');
  });

  it('fails design-validated-before-export when design is not validated', () => {
    const state: ProjectState = {
      hasSpec: true,
      hasArchitecture: true,
      hasBOM: true,
      bomHasPlaceholders: false,
      hasDesign: true,
      designValidated: false,
      hasQuote: false,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    const validationCheck = checks.find((c) => c.name === 'design-validated-before-export');
    expect(validationCheck).toBeDefined();
    expect(validationCheck!.passed).toBe(false);
    expect(validationCheck!.severity).toBe('error');
  });

  it('warns when quote uses estimated data', () => {
    const state: ProjectState = {
      hasSpec: true,
      hasArchitecture: true,
      hasBOM: true,
      bomHasPlaceholders: false,
      hasDesign: true,
      designValidated: true,
      hasQuote: true,
      quoteIsEstimate: true,
    };

    const checks = validatePolicies(state);
    const quoteCheck = checks.find((c) => c.name === 'quote-estimate-flagged');
    expect(quoteCheck).toBeDefined();
    expect(quoteCheck!.passed).toBe(false);
    expect(quoteCheck!.severity).toBe('warning');
  });

  it('warns on provenance completeness when BOM has placeholders', () => {
    const state: ProjectState = {
      hasSpec: true,
      hasArchitecture: false,
      hasBOM: true,
      bomHasPlaceholders: true,
      hasDesign: false,
      designValidated: false,
      hasQuote: false,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    const provCheck = checks.find((c) => c.name === 'provenance-completeness');
    expect(provCheck).toBeDefined();
    expect(provCheck!.passed).toBe(false);
    expect(provCheck!.severity).toBe('warning');
  });

  it('passes minimal project (no BOM, no design)', () => {
    const state: ProjectState = {
      hasSpec: false,
      hasArchitecture: false,
      hasBOM: false,
      bomHasPlaceholders: false,
      hasDesign: false,
      designValidated: false,
      hasQuote: false,
      quoteIsEstimate: false,
    };

    const checks = validatePolicies(state);
    expect(checks.every((c) => c.passed)).toBe(true);
  });
});

// ── Manifest Generator ───────────────────────────────────────────────────────

describe('generateManifest', () => {
  it('generates a manifest with checksums', () => {
    const artifacts: ArtifactEntryInput[] = [
      makeArtifactEntry({ type: 'schematic', filename: 'board.svg' }),
      makeArtifactEntry({ type: 'gerber', filename: 'gerbers.zip' }),
    ];

    const manifest = generateManifest('project-1', artifacts);

    expect(manifest.projectId).toBe('project-1');
    expect(manifest.artifacts).toHaveLength(2);
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.generatedAt).toBeGreaterThan(0);
    expect(manifest.id).toContain('manifest-');
    expect(manifest.artifacts[0]!.checksum).toBeTruthy();
    expect(manifest.artifacts[0]!.size).toBeGreaterThan(0);
  });

  it('generates deterministic checksums for same input', () => {
    const artifacts: ArtifactEntryInput[] = [
      makeArtifactEntry({ type: 'bom', filename: 'bom.csv' }),
    ];

    const manifest1 = generateManifest('project-1', artifacts);
    const manifest2 = generateManifest('project-1', artifacts);

    expect(manifest1.artifacts[0]!.checksum).toBe(manifest2.artifacts[0]!.checksum);
  });

  it('generates different checksums for different inputs', () => {
    const artifacts1: ArtifactEntryInput[] = [
      makeArtifactEntry({ type: 'schematic', filename: 'a.svg' }),
    ];
    const artifacts2: ArtifactEntryInput[] = [
      makeArtifactEntry({ type: 'schematic', filename: 'b.svg' }),
    ];

    const manifest1 = generateManifest('project-1', artifacts1);
    const manifest2 = generateManifest('project-1', artifacts2);

    expect(manifest1.artifacts[0]!.checksum).not.toBe(manifest2.artifacts[0]!.checksum);
  });

  it('estimates sizes based on artifact type', () => {
    const schematicEntry = makeArtifactEntry({ type: 'schematic' });
    const pcbEntry = makeArtifactEntry({ type: 'pcb' });

    const manifest = generateManifest('project-1', [schematicEntry, pcbEntry]);

    const schematicSize = manifest.artifacts[0]!.size;
    const pcbSize = manifest.artifacts[1]!.size;
    expect(pcbSize).toBeGreaterThan(schematicSize);
  });

  it('generates unique manifest IDs', () => {
    const artifacts: ArtifactEntryInput[] = [
      makeArtifactEntry({ type: 'report', filename: 'report.json' }),
    ];

    const manifest1 = generateManifest('project-1', artifacts);
    const manifest2 = generateManifest('project-2', artifacts);

    expect(manifest1.id).not.toBe(manifest2.id);
  });

  it('handles empty artifact list', () => {
    const manifest = generateManifest('project-1', []);
    expect(manifest.artifacts).toHaveLength(0);
    expect(manifest.id).toBeTruthy();
  });
});

// ── Report Generator ─────────────────────────────────────────────────────────

describe('generateAuditReport', () => {
  it('assembles a full audit report', async () => {
    const store = new InMemoryAuditTraceStore();
    await store.append(
      makeTrace({ id: 't1', projectId: 'p1', category: 'spec', action: 'spec_created' }),
    );
    await store.append(
      makeTrace({ id: 't2', projectId: 'p1', category: 'bom', action: 'bom_generated' }),
    );

    const manifest = generateManifest('p1', [
      makeArtifactEntry({ type: 'bom', filename: 'bom.csv' }),
    ]);

    const policyChecks = validatePolicies({
      hasSpec: true,
      hasArchitecture: true,
      hasBOM: true,
      bomHasPlaceholders: false,
      hasDesign: true,
      designValidated: true,
      hasQuote: true,
      quoteIsEstimate: false,
    });

    const bomProvenance: BOMProvenanceEntry[] = [
      { mpn: 'STM32F407VGT6', hasProvenance: true, isEstimate: false },
      { mpn: 'AMS1117-3.3', hasProvenance: true, isEstimate: true },
      { mpn: 'UNKNOWN-PART', hasProvenance: false, isEstimate: true },
    ];

    const report = await generateAuditReport('p1', store, manifest, policyChecks, bomProvenance);

    expect(report.projectId).toBe('p1');
    expect(report.generatedAt).toBeGreaterThan(0);
    expect(report.summary.totalTraces).toBe(2);
    expect(report.summary.categories['spec']).toBe(1);
    expect(report.summary.categories['bom']).toBe(1);
    expect(report.summary.warnings).toBe(0);
    expect(report.summary.errors).toBe(0);
    expect(report.traces).toHaveLength(2);
    expect(report.manifest).not.toBeNull();
    expect(report.policyChecks).toHaveLength(policyChecks.length);
    expect(report.provenanceSummary.totalParts).toBe(3);
    expect(report.provenanceSummary.partsWithProvenance).toBe(2);
    expect(report.provenanceSummary.partsWithEstimates).toBe(2);
    expect(report.provenanceSummary.missingProvenance).toEqual(['UNKNOWN-PART']);
  });

  it('counts warnings and errors correctly', async () => {
    const store = new InMemoryAuditTraceStore();

    const policyChecks = validatePolicies({
      hasSpec: false,
      hasArchitecture: false,
      hasBOM: true,
      bomHasPlaceholders: true,
      hasDesign: false,
      designValidated: false,
      hasQuote: true,
      quoteIsEstimate: true,
    });

    const report = await generateAuditReport('p1', store, null, policyChecks, []);

    const errors = policyChecks.filter((c) => !c.passed && c.severity === 'error');
    const warnings = policyChecks.filter((c) => !c.passed && c.severity === 'warning');
    expect(report.summary.errors).toBe(errors.length);
    expect(report.summary.warnings).toBe(warnings.length);
  });

  it('handles null manifest', async () => {
    const store = new InMemoryAuditTraceStore();
    const report = await generateAuditReport('p1', store, null, [], []);

    expect(report.manifest).toBeNull();
    expect(report.summary.totalTraces).toBe(0);
    expect(report.provenanceSummary.totalParts).toBe(0);
  });

  it('handles empty BOM provenance', async () => {
    const store = new InMemoryAuditTraceStore();
    const report = await generateAuditReport('p1', store, null, [], []);

    expect(report.provenanceSummary.totalParts).toBe(0);
    expect(report.provenanceSummary.partsWithProvenance).toBe(0);
    expect(report.provenanceSummary.missingProvenance).toHaveLength(0);
  });
});
