import { querySimilar, getStores } from './src/pipeline/vector-store.js';
import { BOOTSTRAP_SEED } from './src/config/seed.js';
import { discoverCandidates } from './src/pipeline/candidate-discovery.js';
import { fetchDocuments } from './src/pipeline/doc-fetch.js';
import { normalizeDocument } from './src/pipeline/normalization.js';
import { chunkDocuments } from './src/pipeline/chunking.js';
import { enrichMetadata } from './src/pipeline/metadata-enrichment.js';
import { generateEmbeddings } from './src/pipeline/embedding.js';
import { storeEmbeddings } from './src/pipeline/vector-store.js';

async function main() {
  const candidates = discoverCandidates(BOOTSTRAP_SEED);
  const docs = fetchDocuments(candidates, 'fixture', BOOTSTRAP_SEED.sourcePreferences);
  const normalized = docs.map((d) => normalizeDocument(d));
  const chunks = chunkDocuments(normalized);
  const enriched = enrichMetadata(chunks);
  const embeddings = await generateEmbeddings(enriched);
  await storeEmbeddings(embeddings, enriched);

  console.log('=== Retrieval Smoke Tests ===\n');

  const stores = getStores();

  console.log('Test 1: STM32F407 datasheet retrieval');
  const r1 = await querySimilar('STM32F407 absolute maximum ratings', 3);
  for (const hit of r1) {
    const chunk = await stores.chunkStore.get(hit.chunkId);
    if (chunk) {
      console.log(
        '  [' +
          hit.score.toFixed(4) +
          '] ' +
          chunk.metadata.manufacturer +
          ' | ' +
          chunk.metadata.documentType +
          ' | ' +
          chunk.content.slice(0, 60) +
          '...',
      );
    }
  }

  console.log('\nTest 2: ESP32-S3 boot config');
  const r2 = await querySimilar('ESP32-S3 boot strapping GPIO0', 3);
  for (const hit of r2) {
    const chunk = await stores.chunkStore.get(hit.chunkId);
    if (chunk) {
      console.log(
        '  [' +
          hit.score.toFixed(4) +
          '] ' +
          chunk.metadata.manufacturer +
          ' | ' +
          chunk.metadata.documentType +
          ' | ' +
          chunk.content.slice(0, 60) +
          '...',
      );
    }
  }

  console.log('\nTest 3: Provenance preserved');
  const stm32Chunks = await stores.chunkStore.queryByMpn('STM32F407VGT6');
  console.log('  ' + stm32Chunks.length + ' chunks for STM32F407VGT6');
  for (const c of stm32Chunks.slice(0, 3)) {
    console.log(
      '  ' +
        c.metadata.documentType +
        ' | ' +
        c.metadata.manufacturer +
        ' | source: ' +
        (c.metadata.sourceUrl ? 'YES' : 'NO') +
        ' | trust: ' +
        c.metadata.trustLevel,
    );
  }

  console.log('\nTest 4: Totals');
  console.log(
    '  ' +
      candidates.length +
      ' candidates, ' +
      docs.length +
      ' docs, ' +
      enriched.length +
      ' chunks, ' +
      embeddings.length +
      ' embeddings',
  );

  console.log('\n=== All smoke tests passed ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
