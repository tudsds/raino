import type { SeedConfig, CandidateSet } from './types.js';

let candidateCounter = 0;

function makeCandidateId(family: string, mpn: string): string {
  candidateCounter++;
  return `candidate_${family}_${mpn}_${candidateCounter}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function discoverCandidates(seed: SeedConfig): CandidateSet[] {
  const candidates: CandidateSet[] = [];

  for (const family of seed.families) {
    for (const mpn of family.mpns) {
      candidates.push({
        candidateId: makeCandidateId(family.family, mpn),
        family: family.family,
        manufacturer: family.manufacturer,
        mpn,
        requiredDocTypes: family.requiredDocTypes.slice(),
        expectsErrata: family.expectsErrata,
        requiresPackageDocs: family.requiresPackageDocs,
        requiresAlternates: family.requiresAlternates,
        retrievalLabels: family.retrievalLabels.slice(),
      });
    }
  }

  return candidates;
}
