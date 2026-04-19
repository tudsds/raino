import { promises as fs } from 'fs';
import { join } from 'path';
import {
  type AssembledContext,
  type L0IdentityEntry,
  type L3DeepEntry,
  type PromptModeType,
  TokenBudgets,
  PromptMode,
} from './types';
import { MemoryStore, estimateTokens } from './memory-store';

export interface ContextBuilderOptions {
  /** Project root for locating bootstrap files (SOUL.md, IDENTITY.md, MEMORY.md) */
  projectRoot: string;
  /** Backing store for L1/L2/L3 persistence */
  store: MemoryStore;
}

export class ContextBuilder {
  private projectRoot: string;
  private store: MemoryStore;
  private l0Cache: L0IdentityEntry[] | null = null;

  constructor(options: ContextBuilderOptions) {
    this.projectRoot = options.projectRoot;
    this.store = options.store;
  }

  async build(
    mode: PromptModeType = PromptMode.FULL,
    workflowStage?: string,
  ): Promise<AssembledContext> {
    if (mode === PromptMode.NONE) {
      return emptyContext(PromptMode.NONE);
    }

    const L0 = await this.loadL0();

    if (mode === PromptMode.MINIMAL) {
      const tokens = totalTokens(L0);
      return {
        mode: PromptMode.MINIMAL,
        layers: { L0, L1: [], L2: [], L3: [] },
        totalTokens: tokens,
        compactionTriggered: false,
      };
    }

    const L1 = await this.store.getL1Entries(TokenBudgets.L1_MAX);
    const L2 = await this.store.getL2Entries(workflowStage, TokenBudgets.L2_MAX);

    let currentTokens = totalTokens(L0) + totalTokens(L1) + totalTokens(L2);
    const compactionTriggered = currentTokens > TokenBudgets.COMPACTION_THRESHOLD;

    const L3: L3DeepEntry[] = [];
    if (compactionTriggered) {
      const trimmedL2 = trimToBudget(L2, TokenBudgets.L2_MAX);
      currentTokens = totalTokens(L0) + totalTokens(L1) + totalTokens(trimmedL2);

      return {
        mode: PromptMode.FULL,
        layers: { L0, L1, L2: trimmedL2, L3 },
        totalTokens: currentTokens,
        compactionTriggered: true,
      };
    }

    return {
      mode: PromptMode.FULL,
      layers: { L0, L1, L2, L3 },
      totalTokens: currentTokens,
      compactionTriggered: false,
    };
  }

  async recordL2Entry(
    content: string,
    workflowStage: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.store.store('L2_ON_DEMAND', content, {
      ...metadata,
      workflowStage,
    });
  }

  async recordL1Summary(
    content: string,
    summaryOf: string[],
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.store.store('L1_ESSENTIAL', content, {
      ...metadata,
      summaryOf,
    });
  }

  invalidateL0Cache(): void {
    this.l0Cache = null;
  }

  private async loadL0(): Promise<L0IdentityEntry[]> {
    if (this.l0Cache) return this.l0Cache;

    const entries: L0IdentityEntry[] = [];

    for (const file of ['SOUL.md', 'IDENTITY.md'] as const) {
      const content = await this.readBootstrapFile(file);
      if (content.length > 0) {
        entries.push(toL0Entry(content, file));
      }
    }

    const memoryContent = await this.readBootstrapFile('MEMORY.md');
    if (memoryContent.length > 0) {
      entries.push(toL0Entry(memoryContent, 'MEMORY.md'));
    }

    this.l0Cache = entries;
    return entries;
  }

  private async readBootstrapFile(filename: string): Promise<string> {
    const filepath = join(this.projectRoot, filename);
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return content.trim();
    } catch {
      return '';
    }
  }
}

function toL0Entry(content: string, source: L0IdentityEntry['source']): L0IdentityEntry {
  return {
    id: `bootstrap-${source}`,
    layer: 'L0_IDENTITY',
    source,
    content,
    tokenCount: estimateTokens(content),
    createdAt: new Date(),
    expiresAt: null,
    metadata: { source },
  };
}

function totalTokens(entries: readonly { tokenCount: number }[]): number {
  return entries.reduce((sum, e) => sum + e.tokenCount, 0);
}

function trimToBudget<T extends { tokenCount: number }>(entries: T[], budget: number): T[] {
  let remaining = budget;
  const result: T[] = [];
  for (const entry of entries) {
    if (entry.tokenCount <= remaining) {
      result.push(entry);
      remaining -= entry.tokenCount;
    }
  }
  return result;
}

function emptyContext(mode: PromptModeType): AssembledContext {
  return {
    mode,
    layers: { L0: [], L1: [], L2: [], L3: [] },
    totalTokens: 0,
    compactionTriggered: false,
  };
}
