import { FIXTURE_DOCUMENTS } from '../fixtures/index';
import type { CandidateSet } from './types';
import type { DocumentRecord, SourceType, TrustLevel } from '@raino/rag';

const MANUFACTURER_URL_PATTERNS: Record<
  string,
  Array<{ type: SourceType; urlFn: (mpn: string) => string }>
> = {
  STMicroelectronics: [
    {
      type: 'datasheet',
      urlFn: (mpn) => `https://www.st.com/resource/en/datasheet/${mpn.toLowerCase()}.pdf`,
    },
  ],
  Espressif: [
    {
      type: 'datasheet',
      urlFn: (mpn) =>
        `https://www.espressif.com/sites/default/files/documentation/${mpn.toLowerCase()}_datasheet_en.pdf`,
    },
  ],
  'Texas Instruments': [
    {
      type: 'datasheet',
      urlFn: (mpn) => `https://www.ti.com/lit/ds/symlink/${mpn.toLowerCase()}.pdf`,
    },
  ],
};

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
    throw new Error(
      'Use fetchLiveDocumentsAsync() for live mode — fetch() requires async.',
    );
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

export async function fetchLiveDocumentsAsync(
  candidates: CandidateSet[],
  seedPreferences: Array<{ domain: string; trustLevel: TrustLevel }> = [],
): Promise<DocumentRecord[]> {
  const documents: DocumentRecord[] = [];

  for (const candidate of candidates) {
    const trustLevel = resolveTrustLevel(candidate.manufacturer, seedPreferences);
    const patterns = MANUFACTURER_URL_PATTERNS[candidate.manufacturer];

    if (!patterns) {
      for (const requiredType of candidate.requiredDocTypes) {
        const doc = generateFixtureDocument(
          candidate,
          requiredType,
          'secondary',
          `[DEGRADED] No URL pattern for ${candidate.manufacturer}. Document not available.`,
          '0.0-placeholder',
        );
        doc.metadata.degraded = true;
        doc.metadata.missingSource = true;
        doc.metadata.liveMode = true;
        documents.push(doc);
      }
      continue;
    }

    const coveredTypes = new Set<SourceType>();

    for (const pattern of patterns) {
      const url = pattern.urlFn(candidate.mpn);
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(30_000),
          headers: { 'User-Agent': 'Raino/1.0 (document-ingestion)' },
        });
        if (!response.ok) {
          continue;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        coveredTypes.add(pattern.type);

        const now = Date.now();
        documents.push({
          id: makeDocId(pattern.type, candidate.mpn),
          sourceUrl: url,
          sourceType: pattern.type,
          manufacturer: candidate.manufacturer,
          partFamily: candidate.family,
          mpn: candidate.mpn,
          revision: 'live',
          fetchTimestamp: now,
          trustLevel: trustLevel === 'canonical' ? 'canonical' : 'secondary',
          metadata: {
            liveMode: true,
            rawContentBase64: buffer.toString('base64'),
            rawContentSize: buffer.length,
            fetchedFrom: url,
          },
        });
      } catch {
        // skip failed fetch — individual failures must not crash the pipeline
      }
    }

    for (const requiredType of candidate.requiredDocTypes) {
      if (!coveredTypes.has(requiredType)) {
        const doc = generateFixtureDocument(
          candidate,
          requiredType,
          'secondary',
          `[DEGRADED] Live fetch for ${requiredType} of ${candidate.mpn} failed or unavailable.`,
          '0.0-placeholder',
        );
        doc.metadata.degraded = true;
        doc.metadata.liveMode = true;
        doc.metadata.missingSource = true;
        documents.push(doc);
      }
    }
  }

  return documents;
}
