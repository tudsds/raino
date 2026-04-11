export interface KicadCommand {
  command: string;
  args: string[];
  description: string;
}

export const KicadCliCommands = {
  schErc: (projectPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['sch', 'erc', projectPath],
    description: 'Run schematic electrical rules check',
  }),

  pcbDrc: (projectPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'drc', projectPath],
    description: 'Run PCB design rules check',
  }),

  schExportPdf: (projectPath: string, outputPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['sch', 'export', 'pdf', '--output', outputPath, projectPath],
    description: 'Export schematic to PDF',
  }),

  schExportSvg: (projectPath: string, outputDir: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['sch', 'export', 'svg', '--output-dir', outputDir, projectPath],
    description: 'Export schematic to SVG',
  }),

  schExportNetlist: (projectPath: string, outputPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['sch', 'export', 'netlist', '--output', outputPath, projectPath],
    description: 'Export netlist',
  }),

  pcbExportSvg: (projectPath: string, outputPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'export', 'svg', '--output', outputPath, projectPath],
    description: 'Export PCB to SVG',
  }),

  pcbExportGlb: (projectPath: string, outputPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'export', 'glb', '--output', outputPath, projectPath],
    description: 'Export PCB 3D model to GLB',
  }),

  pcbExportGerbers: (projectPath: string, outputDir: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'export', 'gerbers', '--output-dir', outputDir, projectPath],
    description: 'Export Gerber files',
  }),

  pcbExportPos: (projectPath: string, outputPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'export', 'pos', '--output', outputPath, projectPath],
    description: 'Export pick-and-place file',
  }),

  pcbExportIpc2581: (projectPath: string, outputPath: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'export', 'ipc2581', '--output', outputPath, projectPath],
    description: 'Export IPC-2581',
  }),

  pcbExportOdb: (projectPath: string, outputDir: string): KicadCommand => ({
    command: 'kicad-cli',
    args: ['pcb', 'export', 'odb', '--output-dir', outputDir, projectPath],
    description: 'Export ODB++',
  }),
} as const;
