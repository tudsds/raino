import type { ProjectGenerationRequest, ProjectGenerationResult, BomComponent } from './types';
import { mapBomToKiCad, type KiCadSymbolMapping } from './symbol-mapper';

const PROJECT_TEMPLATE = `(kicad_pro (version 20241127)
  (generator "raino")
  (general
    (project "{projectName}")
  )
)
`;

const SCHEMATIC_TEMPLATE = `(kicad_sch
  (version 20241127)
  (generator "raino")
  (uuid "{uuid}")
  (paper "A4")
  (lib_symbols)
{symbolEntries}
  (sheet_instances
    (path "/" (page "1"))
  )
)
`;

const PCB_TEMPLATE = `(kicad_pcb
  (version 20241127)
  (generator "raino")
  (general
    (thickness 1.6)
  )
  (paper "A4")
  (layers
    (0 "F.Cu" signal)
    (31 "B.Cu" signal)
    (44 "Edge.Cuts" user)
  )
  (setup
    (pad_to_mask_clearance 0.05)
  )
  (net 0 "")
{footprintEntries}
)
`;

function generateUuid(): string {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0');
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${hex()}-${hex()}${hex()}${hex()}`;
}

function buildSymbolEntry(mapping: KiCadSymbolMapping, index: number): string {
  const uuid = generateUuid();
  const yPos = 25.4 + index * 25.4;
  const fields = Object.entries(mapping.fields)
    .map(([name, value]) => {
      if (name === 'Value') return '';
      return `      (property "${name}" "${value}" (at 0 0 0) (effects (font (size 1.27 1.27))))`;
    })
    .filter(Boolean)
    .join('\n');

  return `  (symbol (lib_id "${mapping.library}:${mapping.symbol}") (at 25.4 ${yPos} 0)
    (uuid "${uuid}")
    (property "Reference" "${mapping.reference}" (at 0 -5.08 0) (effects (font (size 1.27 1.27))))
    (property "Value" "${mapping.fields['Value'] ?? ''}" (at 0 5.08 0) (effects (font (size 1.27 1.27))))
${fields}
    (pin "1" (uuid "${generateUuid()}"))
  )`;
}

function buildFootprintEntry(mapping: KiCadSymbolMapping, index: number): string {
  const uuid = generateUuid();
  const xPos = 25.4 + (index % 8) * 25.4;
  const yPos = 25.4 + Math.floor(index / 8) * 25.4;

  return `  (footprint "${mapping.footprint}" (at ${xPos} ${yPos} 0)
    (uuid "${uuid}")
    (property "Reference" "${mapping.reference}" (at 0 -5.08 0))
    (property "Value" "${mapping.fields['Value'] ?? ''}" (at 0 5.08 0))
    (pad "1" smd rect (at 0 0 0) (size 1 1) (layers "F.Cu" "F.Paste" "F.Mask"))
  )`;
}

function validateRequest(request: ProjectGenerationRequest): string[] {
  const errors: string[] = [];

  if (!request.projectId || request.projectId.trim().length === 0) {
    errors.push('projectId is required');
  }
  if (!request.projectName || request.projectName.trim().length === 0) {
    errors.push('projectName is required');
  }
  if (request.bom.length === 0) {
    errors.push('BOM must contain at least one component');
  }

  request.bom.forEach((component: BomComponent, i: number) => {
    if (!component.reference || component.reference.trim().length === 0) {
      errors.push(`BOM entry ${i}: reference is required`);
    }
    if (!component.value || component.value.trim().length === 0) {
      errors.push(`BOM entry ${i}: value is required`);
    }
  });

  return errors;
}

function generateWarnings(request: ProjectGenerationRequest): string[] {
  const warnings: string[] = [];

  const missingMpn = request.bom.filter((c: BomComponent) => !c.mpn || c.mpn.trim().length === 0);
  if (missingMpn.length > 0) {
    warnings.push(
      `${missingMpn.length} component(s) missing MPN: ${missingMpn.map((c: BomComponent) => c.reference).join(', ')}`,
    );
  }

  const missingFootprint = request.bom.filter(
    (c: BomComponent) => !c.footprint || c.footprint.trim().length === 0,
  );
  if (missingFootprint.length > 0) {
    warnings.push(
      `${missingFootprint.length} component(s) missing explicit footprint, using defaults: ${missingFootprint.map((c: BomComponent) => c.reference).join(', ')}`,
    );
  }

  return warnings;
}

export function generateKiCadProject(request: ProjectGenerationRequest): ProjectGenerationResult {
  const startTime = performance.now();

  const requestErrors = validateRequest(request);
  if (requestErrors.length > 0) {
    return {
      projectId: request.projectId,
      success: false,
      errors: requestErrors,
      warnings: [],
      duration: performance.now() - startTime,
    };
  }

  const warnings = generateWarnings(request);
  const errors: string[] = [];

  const symbolMappings = mapBomToKiCad(request.bom);

  const projectName = request.projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const projectPath = `/tmp/raino-projects/${request.projectId}`;
  const schematicPath = `${projectPath}/${projectName}.kicad_sch`;
  const pcbPath = `${projectPath}/${projectName}.kicad_pcb`;

  const projectContent = PROJECT_TEMPLATE.replace('{projectName}', request.projectName);

  const symbolEntries = symbolMappings.map((mapping, i) => buildSymbolEntry(mapping, i)).join('\n');
  const schematicContent = SCHEMATIC_TEMPLATE.replace('{uuid}', generateUuid()).replace(
    '{symbolEntries}',
    symbolEntries,
  );

  const footprintEntries = symbolMappings
    .map((mapping, i) => buildFootprintEntry(mapping, i))
    .join('\n');
  const pcbContent = PCB_TEMPLATE.replace('{footprintEntries}', footprintEntries);

  void projectContent;
  void schematicContent;
  void pcbContent;

  return {
    projectId: request.projectId,
    success: errors.length === 0,
    projectPath: errors.length === 0 ? projectPath : undefined,
    schematicPath: errors.length === 0 ? schematicPath : undefined,
    pcbPath: errors.length === 0 ? pcbPath : undefined,
    errors,
    warnings,
    duration: performance.now() - startTime,
  };
}
