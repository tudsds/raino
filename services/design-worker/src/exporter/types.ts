export type ExportFormat =
  | 'schematic_pdf'
  | 'schematic_svg'
  | 'netlist'
  | 'pcb_svg'
  | 'pcb_glb'
  | 'gerbers'
  | 'pos'
  | 'ipc2581'
  | 'odb'
  | 'bom_csv';

export interface ExportRequest {
  projectId: string;
  projectPath: string;
  format: ExportFormat;
  outputPath: string;
  options?: Record<string, unknown>;
}

export interface ExportResult {
  projectId: string;
  format: ExportFormat;
  success: boolean;
  outputFiles: string[];
  errors: string[];
  duration: number;
  isPlaceholder?: boolean;
}
