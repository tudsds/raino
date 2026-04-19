import { BOOTSTRAP_SEED } from '../config/seed';
import { discoverCandidates } from '../pipeline/candidate-discovery';
import { fetchDocuments } from '../pipeline/doc-fetch';
import { runSufficiencyGate } from '../pipeline/sufficiency-gate';
import { writeSufficiencyReport } from '../storage/local';
import type { SufficiencyReport } from '../pipeline/types';

async function validate(): Promise<void> {
  console.log('[ingest:validate] Running sufficiency validation...');

  const candidates = discoverCandidates(BOOTSTRAP_SEED);
  console.log(`[ingest:validate] ${candidates.length} candidates discovered`);

  const documents = fetchDocuments(candidates, 'fixture', BOOTSTRAP_SEED.sourcePreferences);
  console.log(`[ingest:validate] ${documents.length} documents loaded (fixture mode)`);

  const reports: SufficiencyReport[] = [];

  for (const candidate of candidates) {
    const mpnDocs = documents.filter((d) => d.mpn === candidate.mpn);
    const report = runSufficiencyGate(candidate, mpnDocs, [], {}, 'validate_only');
    reports.push(report);
  }

  let passCount = 0;
  let failCount = 0;

  for (const report of reports) {
    const status = report.overallPass ? 'PASS' : 'FAIL';
    if (report.overallPass) {
      passCount++;
    } else {
      failCount++;
    }

    console.log('');
    console.log(`── ${report.candidateId} ── ${status} ──`);

    for (const check of report.checks) {
      const marker = check.passed ? '✓' : '✗';
      console.log(`  ${marker} [${check.category}] ${check.check}: ${check.details}`);
      if (check.requiredAction) {
        console.log(`    → Action: ${check.requiredAction}`);
      }
    }

    if (report.gaps.length > 0) {
      console.log(`  Gaps (${report.gaps.length}):`);
      for (const gap of report.gaps) {
        console.log(`    - ${gap}`);
      }
    }

    writeSufficiencyReport(report as unknown as Record<string, unknown>);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Validation Summary: ${passCount} passed, ${failCount} failed`);
  console.log('═══════════════════════════════════════════════════');
}

validate().catch((err) => {
  console.error('[ingest:validate] Fatal error:', err);
  process.exit(1);
});
