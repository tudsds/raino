/**
 * Memory system types — 4-layer L0-L3 context stack.
 *
 * L0 Identity  ~100 tokens   SOUL.md + IDENTITY.md, always loaded
 * L1 Essential ~800 tokens   Summarized project state + key decisions
 * L2 On-Demand ~500 tokens   Recent turns, workflow stage details
 * L3 Deep      as-needed     RAG-retrieved engineering docs, datasheets
 */

export const MemoryLayer = {
  /** Always loaded, ~100 tokens */
  L0_IDENTITY: 'L0_IDENTITY',
  /** Summarized project state, ~800 tokens */
  L1_ESSENTIAL: 'L1_ESSENTIAL',
  /** Recent context, ~500 tokens */
  L2_ON_DEMAND: 'L2_ON_DEMAND',
  /** RAG-backed, fetched on context overflow */
  L3_DEEP: 'L3_DEEP',
} as const;

export type MemoryLayerType = (typeof MemoryLayer)[keyof typeof MemoryLayer];

export const TokenBudgets = {
  L0_MAX: 100,
  L1_MAX: 800,
  L2_MAX: 500,
  /** 80% of typical 32K model window */
  COMPACTION_THRESHOLD: 25600,
} as const;

export const PromptMode = {
  /** All layers — new workflows, complex reasoning */
  FULL: 'full',
  /** L0 only — quick lookups, status checks */
  MINIMAL: 'minimal',
  /** No identity — programmatic/internal calls */
  NONE: 'none',
} as const;

export type PromptModeType = (typeof PromptMode)[keyof typeof PromptMode];

export interface MemoryEntry {
  readonly id: string;
  readonly layer: MemoryLayerType;
  readonly content: string;
  readonly tokenCount: number;
  readonly createdAt: Date;
  readonly expiresAt: Date | null;
  readonly metadata: Record<string, unknown>;
}

export interface L0IdentityEntry extends MemoryEntry {
  readonly layer: typeof MemoryLayer.L0_IDENTITY;
  readonly source: 'SOUL.md' | 'IDENTITY.md' | 'MEMORY.md';
}

export interface L1EssentialEntry extends MemoryEntry {
  readonly layer: typeof MemoryLayer.L1_ESSENTIAL;
  readonly summaryOf: string[];
}

export interface L2OnDemandEntry extends MemoryEntry {
  readonly layer: typeof MemoryLayer.L2_ON_DEMAND;
  readonly workflowStage: string;
}

export interface L3DeepEntry extends MemoryEntry {
  readonly layer: typeof MemoryLayer.L3_DEEP;
  readonly retrievalQuery: string;
  readonly sourceDocIds: string[];
}

export interface AssembledContext {
  readonly mode: PromptModeType;
  readonly layers: {
    L0: L0IdentityEntry[];
    L1: L1EssentialEntry[];
    L2: L2OnDemandEntry[];
    L3: L3DeepEntry[];
  };
  readonly totalTokens: number;
  readonly compactionTriggered: boolean;
}

export interface MemoryStoreResult {
  readonly id: string;
  readonly layer: MemoryLayerType;
  readonly stored: boolean;
}

export interface MemoryQuery {
  readonly layer?: MemoryLayerType;
  readonly workflowStage?: string;
  readonly maxTokens?: number;
  readonly since?: Date;
}

export interface DreamConsolidationResult {
  readonly entriesSummarized: number;
  readonly entriesPruned: number;
  readonly summaryTokenCount: number;
  readonly durationMs: number;
}

/** LLM summarization — inject from @raino/llm at orchestration layer */
export type SummarizeFn = (content: string, maxTokens: number) => Promise<string>;

export interface DreamConsolidationConfig {
  readonly summarize: SummarizeFn;
  readonly maxAgeDays?: number;
  readonly batchSize?: number;
}
