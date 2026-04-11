import * as fs from 'node:fs';
import * as path from 'node:path';

export interface JsonSerializable {
  [key: string]: unknown;
}

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'data', 'ingestion');

export function writeJson(
  fileName: string,
  data: JsonSerializable,
  dataDir: string = DEFAULT_DATA_DIR,
): string {
  fs.mkdirSync(dataDir, { recursive: true });
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

export function readJson<T>(fileName: string, dataDir: string = DEFAULT_DATA_DIR): T {
  const filePath = path.join(dataDir, fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function fileExists(fileName: string, dataDir: string = DEFAULT_DATA_DIR): boolean {
  const filePath = path.join(dataDir, fileName);
  return fs.existsSync(filePath);
}

export function listFiles(dataDir: string = DEFAULT_DATA_DIR): string[] {
  if (!fs.existsSync(dataDir)) return [];
  return fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
}

export function writeIngestionManifest(manifest: JsonSerializable, dataDir?: string): string {
  const runId = manifest['runId'] ?? 'unknown';
  return writeJson(`manifest-${runId}.json`, manifest, dataDir);
}

export function writeSufficiencyReport(report: JsonSerializable, dataDir?: string): string {
  const candidateId = report['candidateId'] ?? 'unknown';
  const runId = report['runId'] ?? 'unknown';
  return writeJson(`sufficiency-${runId}-${candidateId}.json`, report, dataDir);
}

export function writePipelineSummary(summary: JsonSerializable, dataDir?: string): string {
  const runId = summary['runId'] ?? 'unknown';
  return writeJson(`summary-${runId}.json`, summary, dataDir);
}

export function readIngestionManifest(runId: string, dataDir?: string): JsonSerializable {
  return readJson(`manifest-${runId}.json`, dataDir);
}

export function readSufficiencyReport(
  runId: string,
  candidateId: string,
  dataDir?: string,
): JsonSerializable {
  return readJson(`sufficiency-${runId}-${candidateId}.json`, dataDir);
}
