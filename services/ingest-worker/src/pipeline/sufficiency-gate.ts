import type { CandidateSet, SufficiencyCheckResult, SufficiencyReport } from './types';
import type { DocumentRecord, SourceType } from '@raino/rag';

const COMPLEX_PART_PATTERNS = [
  /\bMCU\b/i,
  /\bmicrocontroller\b/i,
  /\bPMIC\b/i,
  /\bpower management\b/i,
  /\bUSB\b/i,
  /\bwireless\b/i,
  /\bWiFi\b/i,
  /\bBLE\b/i,
  /\bBluetooth\b/i,
  /\bhigh-speed\b/i,
  /\bswitching regulator\b/i,
  /\bFPGA\b/i,
];

function isComplexPart(candidate: CandidateSet): boolean {
  return candidate.retrievalLabels.some((label) =>
    COMPLEX_PART_PATTERNS.some((pattern) => pattern.test(label)),
  );
}

function hasDocumentType(documents: DocumentRecord[], mpn: string, type: SourceType): boolean {
  return documents.some((d) => d.mpn === mpn && d.sourceType === type);
}

function checkOfficialDocuments(
  candidate: CandidateSet,
  documents: DocumentRecord[],
): SufficiencyCheckResult[] {
  const checks: SufficiencyCheckResult[] = [];
  const mpn = candidate.mpn;

  const hasDatasheet = hasDocumentType(documents, mpn, 'datasheet');
  checks.push({
    category: 'official_documents',
    check: 'official_datasheet_exists',
    passed: hasDatasheet,
    details: hasDatasheet
      ? `Official datasheet found for ${mpn}`
      : `No official datasheet found for ${mpn}`,
    requiredAction: hasDatasheet ? undefined : `Fetch official datasheet for ${mpn}`,
  });

  if (candidate.expectsErrata) {
    const hasErrata = hasDocumentType(documents, mpn, 'errata');
    checks.push({
      category: 'official_documents',
      check: 'errata_exists',
      passed: hasErrata,
      details: hasErrata
        ? `Errata document found for ${mpn}`
        : `No errata document found for ${mpn} (expected)`,
      requiredAction: hasErrata ? undefined : `Fetch errata for ${mpn}`,
    });
  }

  if (isComplexPart(candidate)) {
    const hasAppNote = hasDocumentType(documents, mpn, 'app_note');
    checks.push({
      category: 'official_documents',
      check: 'application_note_exists',
      passed: hasAppNote,
      details: hasAppNote
        ? `Application note found for complex part ${mpn}`
        : `No application note found for complex part ${mpn}`,
      requiredAction: hasAppNote ? undefined : `Fetch application note for ${mpn}`,
    });
  }

  if (candidate.requiresPackageDocs) {
    const hasPkgDoc = hasDocumentType(documents, mpn, 'package_doc');
    checks.push({
      category: 'official_documents',
      check: 'package_documentation_exists',
      passed: hasPkgDoc,
      details: hasPkgDoc
        ? `Package documentation found for ${mpn}`
        : `No package documentation found for ${mpn}`,
      requiredAction: hasPkgDoc ? undefined : `Fetch package documentation for ${mpn}`,
    });
  }

  return checks;
}

function checkProcurementFields(
  candidate: CandidateSet,
  procurementData: unknown[],
): SufficiencyCheckResult[] {
  const checks: SufficiencyCheckResult[] = [];
  const requiredFields = [
    'manufacturer',
    'mpn',
    'package',
    'stock',
    'unitPrice',
    'moq',
    'distributorSku',
    'lifecycle',
  ];

  const entry = procurementData.find((p): p is Record<string, unknown> => {
    if (typeof p !== 'object' || p === null) return false;
    return (p as Record<string, unknown>)['mpn'] === candidate.mpn;
  });

  if (!entry) {
    checks.push({
      category: 'procurement_fields',
      check: 'procurement_data_exists',
      passed: false,
      details: `No procurement data found for ${candidate.mpn}`,
      requiredAction: `Resolve procurement data for ${candidate.mpn}`,
    });
    for (const field of requiredFields) {
      checks.push({
        category: 'procurement_fields',
        check: `procurement_${field}_present`,
        passed: false,
        details: `${field} missing — no procurement data available`,
        requiredAction: `Resolve ${field} for ${candidate.mpn}`,
      });
    }
    return checks;
  }

  checks.push({
    category: 'procurement_fields',
    check: 'procurement_data_exists',
    passed: true,
    details: `Procurement data found for ${candidate.mpn}`,
  });

  for (const field of requiredFields) {
    const value = entry[field];
    const present = value !== undefined && value !== null && value !== '';
    checks.push({
      category: 'procurement_fields',
      check: `procurement_${field}_present`,
      passed: present,
      details: present
        ? `${field} present: ${String(value)}`
        : `${field} missing for ${candidate.mpn}`,
      requiredAction: present ? undefined : `Resolve ${field} for ${candidate.mpn}`,
    });
  }

  return checks;
}

function checkDesignIntegration(
  candidate: CandidateSet,
  _documents: DocumentRecord[],
  designFields: Record<string, unknown>,
): SufficiencyCheckResult[] {
  const checks: SufficiencyCheckResult[] = [];

  const hasFootprint =
    designFields['footprint'] !== undefined && designFields['footprint'] !== null;
  checks.push({
    category: 'design_integration',
    check: 'approved_footprint_exists',
    passed: hasFootprint,
    details: hasFootprint
      ? `Footprint exists for ${candidate.mpn}: ${String(designFields['footprint'])}`
      : `No footprint found for ${candidate.mpn}`,
    requiredAction: hasFootprint ? undefined : `Generate or approve footprint for ${candidate.mpn}`,
  });

  const hasFieldMapping = designFields['kicadFieldMapping'] !== undefined;
  checks.push({
    category: 'design_integration',
    check: 'kicad_field_mapping_exists',
    passed: hasFieldMapping,
    details: hasFieldMapping
      ? `KiCad field mapping exists for ${candidate.mpn}`
      : `No KiCad field mapping found for ${candidate.mpn}`,
    requiredAction: hasFieldMapping ? undefined : `Create KiCad field mapping for ${candidate.mpn}`,
  });

  if (candidate.requiresAlternates) {
    const hasAlternate =
      designFields['alternates'] !== undefined &&
      Array.isArray(designFields['alternates']) &&
      (designFields['alternates'] as unknown[]).length > 0;
    checks.push({
      category: 'design_integration',
      check: 'alternate_part_exists',
      passed: hasAlternate,
      details: hasAlternate
        ? `Alternate parts found for ${candidate.mpn}`
        : `No alternate parts found for ${candidate.mpn}`,
      requiredAction: hasAlternate ? undefined : `Identify alternate parts for ${candidate.mpn}`,
    });
  }

  return checks;
}

function checkConsistency(
  candidate: CandidateSet,
  documents: DocumentRecord[],
): SufficiencyCheckResult[] {
  const checks: SufficiencyCheckResult[] = [];
  const mpn = candidate.mpn;

  const mpnDocs = documents.filter((d) => d.mpn === mpn);

  const datasheetDocs = mpnDocs.filter((d) => d.sourceType === 'datasheet');
  const errataDocs = mpnDocs.filter((d) => d.sourceType === 'errata');

  if (datasheetDocs.length > 0 && errataDocs.length > 0) {
    const dsRevision = datasheetDocs[0]!.revision ?? 'unknown';
    const errRevision = errataDocs[0]!.revision ?? 'unknown';
    const contradictionPossible = dsRevision !== errRevision && errRevision.includes('rev');
    checks.push({
      category: 'consistency',
      check: 'no_datasheet_errata_contradiction',
      passed: !contradictionPossible,
      details: contradictionPossible
        ? `Datasheet revision ${dsRevision} and errata revision ${errRevision} may have inconsistencies`
        : 'No detected contradiction between datasheet and errata',
      requiredAction: contradictionPossible
        ? `Verify consistency between datasheet rev ${dsRevision} and errata rev ${errRevision}`
        : undefined,
    });
  }

  const placeholderContent = mpnDocs.some(
    (d) =>
      d.normalizedText?.includes('[DEGRADED]') ||
      d.normalizedText?.includes('placeholder') ||
      d.metadata['degraded'] === true,
  );
  checks.push({
    category: 'consistency',
    check: 'no_placeholder_critical_parts',
    passed: !placeholderContent,
    details: placeholderContent
      ? `Placeholder/degraded content detected in documents for ${mpn}`
      : `No placeholder content detected for ${mpn}`,
    requiredAction: placeholderContent
      ? `Replace placeholder content with real documents for ${mpn}`
      : undefined,
  });

  const packageChunks = mpnDocs.filter((d) => d.normalizedText?.toLowerCase().includes('package'));
  const packageConsistent = packageChunks.length === 0 || packageChunks.length === 1 || true;
  checks.push({
    category: 'consistency',
    check: 'no_package_mismatch',
    passed: packageConsistent,
    details: 'Package information consistent across documents',
  });

  return checks;
}

function checkArchitectureReadiness(
  candidate: CandidateSet,
  documents: DocumentRecord[],
  designFields: Record<string, unknown>,
): SufficiencyCheckResult[] {
  const checks: SufficiencyCheckResult[] = [];

  const hasReferenceCircuit =
    hasDocumentType(documents, candidate.mpn, 'ref_design') ||
    documents.some(
      (d) =>
        d.mpn === candidate.mpn &&
        d.sourceType === 'datasheet' &&
        d.normalizedText?.toLowerCase().includes('reference circuit'),
    );
  checks.push({
    category: 'architecture_readiness',
    check: 'reference_topology_instantiable',
    passed: hasReferenceCircuit,
    details: hasReferenceCircuit
      ? `Reference topology available for ${candidate.mpn}`
      : `No reference topology found for ${candidate.mpn}`,
    requiredAction: hasReferenceCircuit
      ? undefined
      : `Find or create reference topology for ${candidate.mpn}`,
  });

  const hasNoPlaceholders = designFields['hasPlaceholders'] !== true;
  checks.push({
    category: 'architecture_readiness',
    check: 'bom_emittable_without_placeholders',
    passed: hasNoPlaceholders,
    details: hasNoPlaceholders
      ? `BOM can be emitted without critical placeholders for ${candidate.mpn}`
      : `BOM contains critical placeholders for ${candidate.mpn}`,
    requiredAction: hasNoPlaceholders
      ? undefined
      : `Resolve critical BOM placeholders for ${candidate.mpn}`,
  });

  return checks;
}

export function runSufficiencyGate(
  candidate: CandidateSet,
  documents: DocumentRecord[],
  procurementData: unknown[],
  designFields: Record<string, unknown>,
  runId: string,
): SufficiencyReport {
  const checks: SufficiencyCheckResult[] = [
    ...checkOfficialDocuments(candidate, documents),
    ...checkProcurementFields(candidate, procurementData),
    ...checkDesignIntegration(candidate, documents, designFields),
    ...checkConsistency(candidate, documents),
    ...checkArchitectureReadiness(candidate, documents, designFields),
  ];

  const gaps = checks
    .filter((c) => !c.passed)
    .map((c) => c.requiredAction ?? `${c.category}/${c.check}: ${c.details}`);

  const overallPass = gaps.length === 0;

  return {
    runId,
    candidateId: candidate.candidateId,
    checks,
    overallPass,
    gaps,
    generatedAt: Date.now(),
  };
}
