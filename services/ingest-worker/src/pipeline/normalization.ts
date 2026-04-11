import type { DocumentRecord } from '@raino/rag';

export function normalizeDocument(doc: DocumentRecord): DocumentRecord {
  const raw = getRawContent(doc);
  const normalized = normalizeText(raw);
  const sectionPreserved = preserveSectionBoundaries(normalized);

  return {
    ...doc,
    normalizedText: sectionPreserved,
  };
}

function getRawContent(doc: DocumentRecord): string {
  const raw = doc.metadata['rawContent'];
  if (typeof raw === 'string' && raw.length > 0) {
    return raw;
  }
  return doc.normalizedText ?? '';
}

function normalizeText(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/\t/g, '    ').trimEnd())
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function preserveSectionBoundaries(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let prevWasBlank = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeader = /^(#{1,6}\s|\.+\s*[A-Z]|Table\s+\d|Figure\s+\d|Section\s+\d)/.test(trimmed);
    const isUpperCaseHeader = /^[A-Z][A-Z\s&/:.-]{4,}$/.test(trimmed) && trimmed.length < 80;

    if ((isHeader || isUpperCaseHeader) && result.length > 0 && !prevWasBlank) {
      result.push('');
    }

    result.push(line);
    prevWasBlank = trimmed.length === 0;
  }

  return result.join('\n');
}
