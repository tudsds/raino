import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';

export interface ArtifactManifestEntry {
  fileName: string;
  filePath: string;
  artifactType: string;
  fileSize: number;
  checksum: string;
  checksumAlgorithm: string;
  mimeType: string;
  generatedAt: number;
  metadata: Record<string, unknown>;
}

export interface ArtifactManifest {
  id: string;
  projectId: string;
  entries: ArtifactManifestEntry[];
  generatedAt: number;
  totalSize: number;
  totalFiles: number;
}

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gbr': 'application/octet-stream',
  '.csv': 'text/csv',
  '.xml': 'application/xml',
  '.net': 'text/plain',
  '.zip': 'application/zip',
  '.kicad_pro': 'application/json',
  '.kicad_sch': 'application/json',
  '.kicad_pcb': 'application/json',
};

const ARTIFACT_TYPE_MAP: Record<string, string> = {
  '.pdf': 'report',
  '.svg': 'preview',
  '.glb': '3d_model',
  '.gbr': 'gerber',
  '.csv': 'bom',
  '.xml': 'manufacturing_bundle',
  '.net': 'netlist',
  '.kicad_pro': 'project',
  '.kicad_sch': 'schematic',
  '.kicad_pcb': 'pcb',
};

function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

function getArtifactType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return ARTIFACT_TYPE_MAP[ext] ?? 'unknown';
}

async function computeFileChecksum(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

export async function generateArtifactManifest(
  projectId: string,
  outputFiles: string[],
): Promise<ArtifactManifest> {
  const entries: ArtifactManifestEntry[] = [];
  let totalSize = 0;

  for (const filePath of outputFiles) {
    try {
      const fileStat = await stat(filePath);
      const checksum = await computeFileChecksum(filePath);

      const entry: ArtifactManifestEntry = {
        fileName: basename(filePath),
        filePath,
        artifactType: getArtifactType(filePath),
        fileSize: fileStat.size,
        checksum,
        checksumAlgorithm: 'sha256',
        mimeType: getMimeType(filePath),
        generatedAt: Date.now(),
        metadata: {},
      };

      entries.push(entry);
      totalSize += fileStat.size;
    } catch {
      const entry: ArtifactManifestEntry = {
        fileName: basename(filePath),
        filePath,
        artifactType: getArtifactType(filePath),
        fileSize: 0,
        checksum: 'pending',
        checksumAlgorithm: 'sha256',
        mimeType: getMimeType(filePath),
        generatedAt: Date.now(),
        metadata: { error: 'file_not_found' },
      };

      entries.push(entry);
    }
  }

  const manifestPayload = [
    projectId,
    Date.now(),
    ...entries.map((e) => `${e.fileName}:${e.checksum}`),
  ].join('|');
  const manifestId = `manifest-${createHash('sha256').update(manifestPayload).digest('hex').substring(0, 16)}`;

  return {
    id: manifestId,
    projectId,
    entries,
    generatedAt: Date.now(),
    totalSize,
    totalFiles: entries.length,
  };
}

export async function uploadArtifactsToStorage(
  manifest: ArtifactManifest,
  bucket: string,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<{ uploaded: number; failed: number }> {
  let uploaded = 0;
  let failed = 0;

  for (const entry of manifest.entries) {
    try {
      const fileContent = await readFile(entry.filePath);
      const storagePath = `${manifest.projectId}/${entry.fileName}`;

      const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': entry.mimeType,
        },
        body: fileContent,
      });

      if (response.ok) {
        uploaded++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { uploaded, failed };
}
