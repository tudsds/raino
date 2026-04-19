import { listFiles, readJson } from '../storage/local';
import * as path from 'node:path';

async function report(): Promise<void> {
  const dataDir = path.resolve(process.cwd(), 'data', 'ingestion');
  const files = listFiles(dataDir);

  if (files.length === 0) {
    console.log('[ingest:report] No ingestion artifacts found. Run ingest:bootstrap first.');
    return;
  }

  const manifestFiles = files.filter((f) => f.startsWith('manifest-'));
  const summaryFiles = files.filter((f) => f.startsWith('summary-'));
  const sufficiencyFiles = files.filter((f) => f.startsWith('sufficiency-'));

  console.log('═══════════════════════════════════════════════════');
  console.log('  Ingestion Report');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Artifacts found: ${files.length}`);
  console.log(`    Manifests:   ${manifestFiles.length}`);
  console.log(`    Summaries:   ${summaryFiles.length}`);
  console.log(`    Sufficiency: ${sufficiencyFiles.length}`);
  console.log('');

  for (const summaryFile of summaryFiles) {
    const summary = readJson<Record<string, unknown>>(summaryFile, dataDir);
    console.log(`── Summary: ${summaryFile} ──`);
    console.log(`  Run ID:       ${summary['runId'] ?? 'unknown'}`);
    console.log(`  Seed Version: ${summary['seedVersion'] ?? 'unknown'}`);
    console.log(`  Mode:         ${summary['mode'] ?? 'unknown'}`);
    console.log(`  Status:       ${summary['status'] ?? 'unknown'}`);
    console.log(`  Duration:     ${summary['totalDuration'] ?? 0} ms`);
    console.log(`  Candidates:   ${summary['candidateCount'] ?? 0}`);
    console.log(`  Documents:    ${summary['documentCount'] ?? 0}`);
    console.log(`  Chunks:       ${summary['chunkCount'] ?? 0}`);
    console.log(`  Embeddings:   ${summary['embeddingCount'] ?? 0}`);
    console.log(
      `  Sufficiency:  ${String(summary['sufficiencyPassCount'] ?? '?')} passed, ${String(summary['sufficiencyFailCount'] ?? '?')} failed`,
    );
    console.log('');
  }

  for (const suffFile of sufficiencyFiles) {
    const suffData = readJson<Record<string, unknown>>(suffFile, dataDir);
    const status = suffData['overallPass'] ? 'PASS' : 'FAIL';
    const checks = suffData['checks'] as Array<Record<string, unknown>> | undefined;
    const gapCount = (suffData['gaps'] as string[] | undefined)?.length ?? 0;
    console.log(
      `  ${status} ${String(suffData['candidateId'] ?? '?')} — ${checks?.length ?? 0} checks, ${gapCount} gaps`,
    );
  }

  console.log('═══════════════════════════════════════════════════');
}

report().catch((err) => {
  console.error('[ingest:report] Fatal error:', err);
  process.exit(1);
});
