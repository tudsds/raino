import { FIXTURE_DOCUMENTS } from '../fixtures/index.js';
import type { CandidateSet } from './types.js';
import type { DocumentRecord, SourceType, TrustLevel } from '@raino/rag';

let docCounter = 0;

function makeDocId(sourceType: string, mpn: string): string {
  docCounter++;
  return `doc_${sourceType}_${mpn}_${docCounter}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function resolveTrustLevel(
  manufacturer: string,
  seedPreferences: Array<{ domain: string; trustLevel: TrustLevel }>,
): TrustLevel {
  const domainMap: Record<string, string> = {
    STMicroelectronics: 'st.com',
    Espressif: 'espressif.com',
    'Texas Instruments': 'ti.com',
    NXP: 'nxp.com',
    Abracon: 'abracon.com',
    Amphenol: 'amphenol.com',
  };
  const domain = domainMap[manufacturer];
  if (domain) {
    const pref = seedPreferences.find((p) => p.domain === domain);
    if (pref) return pref.trustLevel;
  }
  return 'secondary';
}

function generateFixtureDocument(
  candidate: CandidateSet,
  docType: SourceType,
  trustLevel: TrustLevel,
  content: string,
  revision: string,
): DocumentRecord {
  const now = Date.now();
  return {
    id: makeDocId(docType, candidate.mpn),
    sourceUrl: `fixture://${candidate.manufacturer}/${candidate.mpn}/${docType}`,
    sourceType: docType,
    manufacturer: candidate.manufacturer,
    partFamily: candidate.family,
    mpn: candidate.mpn,
    revision,
    fetchTimestamp: now,
    trustLevel,
    metadata: {
      fixtureMode: true,
      label: `Fixture ${docType} for ${candidate.mpn}`,
      rawContent: content,
    },
  };
}

export function fetchDocuments(
  candidates: CandidateSet[],
  mode: 'live' | 'fixture' | 'degraded',
  seedPreferences: Array<{ domain: string; trustLevel: TrustLevel }> = [],
): DocumentRecord[] {
  if (mode === 'live') {
    throw new Error('Live document fetching is not yet implemented. Use fixture or degraded mode.');
  }

  const documents: DocumentRecord[] = [];

  for (const candidate of candidates) {
    const trustLevel = resolveTrustLevel(candidate.manufacturer, seedPreferences);
    const fixtureDocs = FIXTURE_DOCUMENTS.filter(
      (f) => f.mpn === candidate.mpn && f.manufacturer === candidate.manufacturer,
    );

    const coveredTypes = new Set(fixtureDocs.map((f) => f.sourceType));

    for (const fixture of fixtureDocs) {
      const doc = generateFixtureDocument(
        candidate,
        fixture.sourceType,
        trustLevel,
        fixture.content,
        fixture.revision ?? '1.0',
      );
      documents.push(doc);
    }

    if (mode === 'degraded') {
      for (const requiredType of candidate.requiredDocTypes) {
        if (!coveredTypes.has(requiredType)) {
          const doc = generateFixtureDocument(
            candidate,
            requiredType,
            'secondary',
            `[DEGRADED] Placeholder content for ${requiredType} of ${candidate.mpn}. Source document not available.`,
            '0.0-placeholder',
          );
          doc.metadata.degraded = true;
          doc.metadata.missingSource = true;
          documents.push(doc);
        }
      }
    }
  }

  return documents;
}
