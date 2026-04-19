import {
  type DreamConsolidationConfig,
  type DreamConsolidationResult,
  TokenBudgets,
} from './types';
import type { MemoryStore } from './memory-store';

const DEFAULT_MAX_AGE_DAYS = 30;
const DEFAULT_BATCH_SIZE = 50;

export class DreamConsolidator {
  private store: MemoryStore;
  private summarize;
  private maxAgeDays: number;
  private batchSize: number;

  constructor(store: MemoryStore, config: DreamConsolidationConfig) {
    this.store = store;
    this.summarize = config.summarize;
    this.maxAgeDays = config.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS;
    this.batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE;
  }

  async consolidate(): Promise<DreamConsolidationResult> {
    const startTime = Date.now();

    const pruned = await this.store.removeOlderThan(this.maxAgeDays);

    const l2Entries = await this.store.getAllByLayer('L2_ON_DEMAND');
    const toSummarize = l2Entries.slice(0, this.batchSize);

    if (toSummarize.length === 0) {
      return {
        entriesSummarized: 0,
        entriesPruned: pruned,
        summaryTokenCount: 0,
        durationMs: Date.now() - startTime,
      };
    }

    const combinedContent = toSummarize
      .map((e) => `[${e.metadata['workflowStage'] ?? 'unknown'}] ${e.content}`)
      .join('\n\n');

    const summary = await this.summarize(combinedContent, TokenBudgets.L1_MAX);

    const entryIds = toSummarize.map((e) => e.id);
    const summaryOf = toSummarize.map((e) => e.id);

    await this.store.replaceEntries(entryIds, 'L1_ESSENTIAL', summary, {
      summaryOf,
      consolidatedAt: new Date().toISOString(),
    });

    return {
      entriesSummarized: toSummarize.length,
      entriesPruned: pruned,
      summaryTokenCount: combinedContent.length > 0 ? Math.ceil(summary.length / 4) : 0,
      durationMs: Date.now() - startTime,
    };
  }
}
