import type { BOM, BOMRow } from '../schemas/bom';

export interface BOMCompletenessResult {
  complete: boolean;
  missingFields: string[];
  warnings: string[];
}

const REQUIRED_FIELDS: (keyof BOMRow)[] = [
  'reference',
  'value',
  'symbol',
  'footprint',
  'manufacturer',
  'mpn',
  'lifecycle',
  'riskLevel',
];

export function validateBOMCompleteness(bom: BOM): BOMCompletenessResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  for (const row of bom.rows) {
    for (const field of REQUIRED_FIELDS) {
      const value = row[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(`Row "${row.reference}": missing ${field}`);
      }
    }

    if (row.unitPrice === undefined) {
      warnings.push(`Row "${row.reference}": unitPrice not set — quote accuracy may be reduced`);
    }
    if (row.stock === undefined) {
      warnings.push(`Row "${row.reference}": stock not set — availability unknown`);
    }
    if (row.datasheetUrl === undefined) {
      warnings.push(`Row "${row.reference}": datasheetUrl not set`);
    }
    if (row.distributor === undefined) {
      warnings.push(`Row "${row.reference}": distributor not set`);
    }
    if (row.lifecycle === 'unknown') {
      warnings.push(`Row "${row.reference}": lifecycle status is "unknown"`);
    }
    if (row.riskLevel === 'high') {
      warnings.push(`Row "${row.reference}": marked as high risk — consider alternates`);
    }
    if (row.alternates.length === 0 && row.riskLevel !== 'low') {
      warnings.push(`Row "${row.reference}": no alternate parts listed for non-low-risk component`);
    }
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

export interface PlaceholderCheckResult {
  hasPlaceholders: boolean;
  placeholders: string[];
}

const PLACEHOLDER_PATTERNS = [
  /^TBD$/i,
  /^FIXME$/i,
  /^TODO$/i,
  /^PLACEHOLDER$/i,
  /^XXX+$/i,
  /^TEMP$/i,
  /^UNKNOWN$/i,
  /^UNSPECIFIED$/i,
];

function isPlaceholder(value: string | undefined): boolean {
  if (value === undefined) return false;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value.trim()));
}

export function checkBOMForPlaceholders(bom: BOM): PlaceholderCheckResult {
  const placeholders: string[] = [];

  const textFields: (keyof BOMRow)[] = [
    'reference',
    'value',
    'symbol',
    'footprint',
    'manufacturer',
    'mpn',
    'distributor',
    'distributorPn',
    'package',
    'notes',
  ];

  for (const row of bom.rows) {
    for (const field of textFields) {
      const raw = row[field];
      if (typeof raw === 'string' && isPlaceholder(raw)) {
        placeholders.push(`Row "${row.reference}": ${field}="${raw}"`);
      }
    }
  }

  return {
    hasPlaceholders: placeholders.length > 0,
    placeholders,
  };
}
