export interface ArtifactEntry {
  type:
    | 'schematic'
    | 'pcb'
    | 'bom'
    | 'gerber'
    | '3d_model'
    | 'manufacturing_bundle'
    | 'datasheet'
    | 'report';
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

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function computeChecksum(entry: ArtifactEntryInput): string {
  const payload = [
    entry.type,
    entry.filename,
    entry.path,
    entry.source,
    String(entry.generatedAt),
    JSON.stringify(entry.metadata),
  ].join('|');
  return simpleHash(payload);
}

function estimateSize(entry: ArtifactEntryInput): number {
  const metadataSize = JSON.stringify(entry.metadata).length;
  const baseSizes: Record<string, number> = {
    schematic: 50_000,
    pcb: 200_000,
    bom: 10_000,
    gerber: 100_000,
    '3d_model': 500_000,
    manufacturing_bundle: 1_000_000,
    datasheet: 300_000,
    report: 5_000,
  };
  const baseSize = baseSizes[entry.type] ?? 10_000;
  return baseSize + metadataSize;
}

export function generateManifest(
  projectId: string,
  artifacts: ArtifactEntryInput[],
): ArtifactManifest {
  const now = Date.now();

  const completeArtifacts: ArtifactEntry[] = artifacts.map((entry) => ({
    ...entry,
    checksum: computeChecksum(entry),
    size: estimateSize(entry),
  }));

  const manifestPayload = [projectId, now, ...completeArtifacts.map((a) => a.checksum)].join(':');
  const manifestId = `manifest-${simpleHash(manifestPayload)}-${now}`;

  return {
    id: manifestId,
    projectId,
    artifacts: completeArtifacts,
    generatedAt: now,
    version: '1.0.0',
  };
}
