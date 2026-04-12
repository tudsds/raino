export interface ArtifactEntry {
    type: 'schematic' | 'pcb' | 'bom' | 'gerber' | '3d_model' | 'manufacturing_bundle' | 'datasheet' | 'report';
    filename: string;
    path: string;
    checksum: string;
    size: number;
    generatedAt: number;
    source: string;
    metadata: Record<string, unknown>;
}
export interface ArtifactManifest {
    id: string;
    projectId: string;
    artifacts: ArtifactEntry[];
    generatedAt: number;
    version: string;
}
export type ArtifactEntryInput = Omit<ArtifactEntry, 'checksum' | 'size'>;
export declare function generateManifest(projectId: string, artifacts: ArtifactEntryInput[]): ArtifactManifest;
//# sourceMappingURL=generator.d.ts.map