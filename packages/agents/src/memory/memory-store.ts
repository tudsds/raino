import { randomUUID } from 'crypto';
import {
  type MemoryEntry,
  type MemoryLayerType,
  type MemoryQuery,
  type MemoryStoreResult,
  type L0IdentityEntry,
  type L1EssentialEntry,
  type L2OnDemandEntry,
} from './types';

interface StoredEntry extends MemoryEntry {
  updatedAt: Date;
}

export class MemoryStore {
  private entries: Map<string, StoredEntry> = new Map();
  private filePath: string | null;

  constructor(filePath?: string) {
    this.filePath = filePath ?? null;
  }

  async store(
    layer: MemoryLayerType,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<MemoryStoreResult> {
    const id = randomUUID();
    const tokenCount = estimateTokens(content);
    const now = new Date();

    const entry: StoredEntry = {
      id,
      layer,
      content,
      tokenCount,
      createdAt: now,
      updatedAt: now,
      expiresAt: null,
      metadata: metadata ?? {},
    };

    this.entries.set(id, entry);

    if (this.filePath) {
      await this.persistToFile();
    }

    return { id, layer, stored: true };
  }

  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.entries.values());

    if (query.layer) {
      results = results.filter((e) => e.layer === query.layer);
    }

    if (query.workflowStage) {
      results = results.filter((e) => e.metadata['workflowStage'] === query.workflowStage);
    }

    if (query.since) {
      results = results.filter((e) => e.createdAt >= query.since!);
    }

    if (query.maxTokens !== undefined && query.maxTokens > 0) {
      let budget = query.maxTokens;
      const capped: StoredEntry[] = [];
      for (const entry of results) {
        if (entry.tokenCount <= budget) {
          capped.push(entry);
          budget -= entry.tokenCount;
        }
      }
      results = capped;
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getL0Entries(): Promise<L0IdentityEntry[]> {
    const entries = await this.query({ layer: 'L0_IDENTITY' });
    return entries.map(
      (e): L0IdentityEntry => ({
        ...e,
        layer: 'L0_IDENTITY',
        source: (e.metadata['source'] as L0IdentityEntry['source']) ?? 'MEMORY.md',
      }),
    );
  }

  async getL1Entries(maxTokens?: number): Promise<L1EssentialEntry[]> {
    const entries = await this.query({
      layer: 'L1_ESSENTIAL',
      maxTokens,
    });
    return entries.map(
      (e): L1EssentialEntry => ({
        ...e,
        layer: 'L1_ESSENTIAL',
        summaryOf: (e.metadata['summaryOf'] as string[]) ?? [],
      }),
    );
  }

  async getL2Entries(workflowStage?: string, maxTokens?: number): Promise<L2OnDemandEntry[]> {
    const entries = await this.query({
      layer: 'L2_ON_DEMAND',
      workflowStage,
      maxTokens,
    });
    return entries.map(
      (e): L2OnDemandEntry => ({
        ...e,
        layer: 'L2_ON_DEMAND',
        workflowStage: (e.metadata['workflowStage'] as string) ?? 'unknown',
      }),
    );
  }

  async remove(id: string): Promise<boolean> {
    const deleted = this.entries.delete(id);
    if (deleted && this.filePath) {
      await this.persistToFile();
    }
    return deleted;
  }

  async removeOlderThan(maxAgeDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);

    let pruned = 0;
    for (const [id, entry] of this.entries) {
      if (entry.createdAt < cutoff) {
        this.entries.delete(id);
        pruned++;
      }
    }

    if (pruned > 0 && this.filePath) {
      await this.persistToFile();
    }

    return pruned;
  }

  async replaceEntries(
    entryIds: string[],
    replacementLayer: MemoryLayerType,
    replacementContent: string,
    replacementMetadata: Record<string, unknown>,
  ): Promise<MemoryStoreResult> {
    for (const id of entryIds) {
      this.entries.delete(id);
    }

    const result = await this.store(replacementLayer, replacementContent, replacementMetadata);
    return result;
  }

  async getAllByLayer(layer: MemoryLayerType): Promise<StoredEntry[]> {
    return this.filterByLayer(layer);
  }

  private filterByLayer(layer: MemoryLayerType): StoredEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.layer === layer)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getSize(): number {
    return this.entries.size;
  }

  private async persistToFile(): Promise<void> {
    if (!this.filePath) return;

    const { promises: fs } = await import('fs');
    const serializable = Array.from(this.entries.values());
    await fs.writeFile(this.filePath, JSON.stringify(serializable, null, 2), 'utf-8');
  }

  async loadFromFile(): Promise<void> {
    if (!this.filePath) return;

    const { promises: fs } = await import('fs');

    let data: string;
    try {
      data = await fs.readFile(this.filePath, 'utf-8');
    } catch {
      return;
    }

    const parsed: StoredEntry[] = JSON.parse(data);
    for (const entry of parsed) {
      this.entries.set(entry.id, {
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
        expiresAt: entry.expiresAt ? new Date(entry.expiresAt) : null,
      });
    }
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
