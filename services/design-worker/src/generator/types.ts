/**
 * Types for KiCad project generation.
 *
 * These define the contract between the design-worker service
 * and the external KiCad worker boundary.
 */

export interface BomComponent {
  reference: string;
  value: string;
  mpn: string;
  footprint: string;
  symbol: string;
  manufacturer: string;
  quantity: number;
}

export interface ArchitectureSpec {
  name: string;
  processorType: string;
  powerTopology: string;
  interfaceSet: string[];
  referenceTopology: Record<string, unknown>;
}

export interface ProjectGenerationRequest {
  projectId: string;
  projectName: string;
  bom: BomComponent[];
  architecture: ArchitectureSpec;
  netlist?: string;
}

export interface ProjectGenerationResult {
  projectId: string;
  success: boolean;
  projectPath?: string;
  schematicPath?: string;
  pcbPath?: string;
  errors: string[];
  warnings: string[];
  duration: number;
}
