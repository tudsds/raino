export type DesignJobType =
  | 'generate_project'
  | 'run_erc'
  | 'run_drc'
  | 'export_schematic_pdf'
  | 'export_schematic_svg'
  | 'export_netlist'
  | 'export_pcb_svg'
  | 'export_pcb_glb'
  | 'export_gerbers'
  | 'export_pos'
  | 'export_ipc2581'
  | 'export_odb'
  | 'export_bom';

export interface DesignJobResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  outputFiles: string[];
  duration: number;
}

export interface DesignJob {
  id: string;
  projectId: string;
  type: DesignJobType;
  status: 'queued' | 'running' | 'completed' | 'failed';
  inputPath?: string;
  outputPath?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: DesignJobResult;
  error?: string;
}
