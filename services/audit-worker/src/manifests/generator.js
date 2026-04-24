function simpleHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
function computeChecksum(entry) {
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
function estimateSize(entry) {
  const metadataSize = JSON.stringify(entry.metadata).length;
  const baseSizes = {
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
export function generateManifest(projectId, artifacts) {
  const now = Date.now();
  const completeArtifacts = artifacts.map((entry) => ({
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
//# sourceMappingURL=generator.js.map
