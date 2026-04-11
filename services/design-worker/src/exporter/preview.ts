export interface PreviewAssets {
  schematicSvg?: string;
  pcb2dSvg?: string;
  pcb3dGlb?: string;
}

const MINIMAL_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#ffffff"/>
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#333333" stroke-width="2"/>
  <text x="400" y="300" text-anchor="middle" font-family="monospace" font-size="14" fill="#666666">Raino Fixture Preview</text>
</svg>`;

export function generatePreviewAssets(projectPath: string): PreviewAssets {
  void projectPath;

  return {
    schematicSvg: MINIMAL_SVG,
    pcb2dSvg: MINIMAL_SVG,
    pcb3dGlb: '',
  };
}
