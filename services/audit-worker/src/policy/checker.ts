export interface PolicyCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ProjectState {
  hasSpec: boolean;
  hasArchitecture: boolean;
  hasBOM: boolean;
  bomHasPlaceholders: boolean;
  hasDesign: boolean;
  designValidated: boolean;
  hasQuote: boolean;
  quoteIsEstimate: boolean;
}

export function validatePolicies(projectState: ProjectState): PolicyCheck[] {
  const checks: PolicyCheck[] = [];

  // Spec must exist before BOM generation
  checks.push({
    name: 'spec-before-bom',
    passed: !projectState.hasBOM || projectState.hasSpec,
    message:
      projectState.hasBOM && !projectState.hasSpec
        ? 'BOM exists but no structured spec was found — spec must be created before BOM generation'
        : 'Spec requirement satisfied for BOM generation',
    severity: projectState.hasBOM && !projectState.hasSpec ? 'error' : 'info',
  });

  // Architecture must be selected before design
  checks.push({
    name: 'architecture-before-design',
    passed: !projectState.hasDesign || projectState.hasArchitecture,
    message:
      projectState.hasDesign && !projectState.hasArchitecture
        ? 'Design exists but no architecture template was selected — architecture must be chosen before design'
        : 'Architecture requirement satisfied for design generation',
    severity: projectState.hasDesign && !projectState.hasArchitecture ? 'error' : 'info',
  });

  // BOM must not have critical placeholders before design generation
  checks.push({
    name: 'bom-no-placeholders-before-design',
    passed: !projectState.hasDesign || !projectState.bomHasPlaceholders,
    message:
      projectState.hasDesign && projectState.bomHasPlaceholders
        ? 'Design generated but BOM still has placeholder entries — resolve critical placeholders'
        : 'BOM placeholder check satisfied',
    severity: projectState.hasDesign && projectState.bomHasPlaceholders ? 'warning' : 'info',
  });

  // Design must be validated before export
  checks.push({
    name: 'design-validated-before-export',
    passed: !projectState.hasDesign || projectState.designValidated,
    message:
      projectState.hasDesign && !projectState.designValidated
        ? 'Design exists but has not been validated — run design validation before export'
        : 'Design validation check satisfied',
    severity: projectState.hasDesign && !projectState.designValidated ? 'error' : 'info',
  });

  // Quote must record if using estimate data
  checks.push({
    name: 'quote-estimate-flagged',
    passed: !projectState.hasQuote || !projectState.quoteIsEstimate,
    message:
      projectState.hasQuote && projectState.quoteIsEstimate
        ? 'Quote is based on estimated data — confirm pricing with live supplier quotes before proceeding'
        : 'Quote data source check satisfied',
    severity: projectState.hasQuote && projectState.quoteIsEstimate ? 'warning' : 'info',
  });

  // All critical parts must have provenance (check expressed via BOM placeholders)
  checks.push({
    name: 'provenance-completeness',
    passed: !projectState.hasBOM || !projectState.bomHasPlaceholders,
    message:
      projectState.hasBOM && projectState.bomHasPlaceholders
        ? 'BOM contains parts without full provenance — resolve placeholder data before manufacturing handoff'
        : 'Provenance completeness check satisfied',
    severity: projectState.hasBOM && projectState.bomHasPlaceholders ? 'warning' : 'info',
  });

  return checks;
}
