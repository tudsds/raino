import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type { DocumentRecord } from '@raino/rag';

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'data', 'raw-docs');

export function storeRawDocuments(
  docs: DocumentRecord[],
  dataDir: string = DEFAULT_DATA_DIR,
): void {
  fs.mkdirSync(dataDir, { recursive: true });

  for (const doc of docs) {
    const content = doc.normalizedText ?? '';
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    const enriched: DocumentRecord = {
      ...doc,
      checksum,
    };

    const fileName = `${doc.id}.json`;
    const filePath = path.join(dataDir, fileName);

    const serializable = {
      ...enriched,
      metadata: enriched.metadata,
    };

    fs.writeFileSync(filePath, JSON.stringify(serializable, null, 2), 'utf-8');
  }
}
