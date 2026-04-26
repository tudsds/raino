'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ── Stage definitions ──────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'candidate_discovery', label: 'Candidate Discovery' },
  { key: 'doc_fetch', label: 'Document Fetch' },
  { key: 'raw_store', label: 'Raw Document Store' },
  { key: 'normalization', label: 'Normalization' },
  { key: 'chunking', label: 'Engineering-Aware Chunking' },
  { key: 'metadata_enrichment', label: 'Metadata Enrichment' },
  { key: 'embedding', label: 'Embedding Generation' },
  { key: 'vector_store', label: 'Vector Store' },
  { key: 'sufficiency_gate', label: 'Sufficiency Gate' },
] as const;

// ── API types ──────────────────────────────────────────────────────────────────

interface StageData {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputCount?: number;
  outputCount?: number;
  errors?: string[];
  duration?: number;
  started_at?: string;
  completed_at?: string;
}

interface IngestionStatus {
  projectId: string;
  runId: string | null;
  status: 'not_started' | 'running' | 'completed' | 'failed' | 'unknown';
  progress: number;
  stages: StageData[];
  meta?: { mode: string; reason: string };
}

interface IngestionTriggerResult extends IngestionStatus {
  error?: string;
  summary?: {
    candidates: number;
    documents: number;
    chunks: number;
    embeddings: number;
    sufficiencyPassCount: number;
    sufficiencyFailCount: number;
    duration: number;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Stage indicator component ──────────────────────────────────────────────────

function StageIndicator({ status }: { status: StageData['status'] }) {
  if (status === 'completed') {
    return (
      <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === 'running') {
    return (
      <div className="w-5 h-5 relative">
        <div className="absolute inset-0 rounded-full border-2 border-[#1565C0] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <svg className="w-5 h-5 text-[#ef5350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border-2 border-[#64748b]" />
  );
}

// ── Progress bar component ─────────────────────────────────────────────────────

function ProgressBar({ status }: { status: StageData['status'] }) {
  const fill = status === 'completed' ? '100%' : status === 'running' ? '60%' : '0%';
  const barColor =
    status === 'completed'
      ? 'bg-[#4CAF50]'
      : status === 'running'
        ? 'bg-[#1565C0]'
        : status === 'failed'
          ? 'bg-[#ef5350]'
          : 'bg-[#64748b]';

  return (
    <div className="h-1.5 w-full rounded-full bg-[rgba(97,145,211,0.15)] overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
        style={{ width: fill }}
      />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function IngestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [status, setStatus] = useState<IngestionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<IngestionTriggerResult | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/ingest/status`);
      if (res.ok) {
        const data: IngestionStatus = await res.json();
        setStatus(data);
        return data;
      }
    } catch {
      // status unavailable
    }
    return null;
  }, [id]);

  // Initial fetch + polling setup
  useEffect(() => {
    let mounted = true;

    async function initialLoad() {
      setLoading(true);
      const data = await fetchStatus();
      if (!mounted) return;
      setLoading(false);

      if (data?.status === 'running') {
        startPolling();
      }
    }

    function startPolling() {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(async () => {
        const data = await fetchStatus();
        if (data && data.status !== 'running') {
          stopPolling();
        }
      }, 2000);
    }

    function stopPolling() {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    initialLoad();

    return () => {
      mounted = false;
      stopPolling();
    };
  }, [fetchStatus, id]);

  const handleTrigger = async () => {
    setTriggering(true);
    setError(null);
    setTriggerResult(null);

    try {
      const res = await fetch(`/api/projects/${id}/ingest/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'fixture' }),
      });

      const rawData: Record<string, unknown> = await res.json();

      if (!res.ok) {
        setError(typeof rawData.error === 'string' ? rawData.error : 'Ingestion trigger failed');
        return;
      }

      setTriggerResult(rawData as unknown as IngestionTriggerResult);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger ingestion');
    } finally {
      setTriggering(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-[#1565C0] text-lg mb-2">Loading ingestion status...</div>
          <p className="text-[#64748b] text-sm">Fetching pipeline data</p>
        </div>
      </div>
    );
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const isRunning = status?.status === 'running';
  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';
  const isNotStarted = !status?.runId || status?.status === 'not_started';

  const stagesFromApi = status?.stages ?? [];
  const stageMap = new Map<string, StageData>();
  for (const s of stagesFromApi) {
    stageMap.set(s.name, s);
  }

  const completedCount = PIPELINE_STAGES.filter(
    (s) => (stageMap.get(s.key)?.status ?? 'pending') === 'completed',
  ).length;
  const overallProgress =
    stagesFromApi.length > 0
      ? Math.round((completedCount / PIPELINE_STAGES.length) * 100)
      : 0;

  const summary = triggerResult?.summary;

  // ── Tabs (consistent with other project pages) ─────────────────────────────

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'ingestion', label: 'Ingestion', href: `/projects/${id}/ingestion`, active: true },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <header className="glass-elevated sticky top-0 z-50 border-b border-[rgba(97,145,211,0.35)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${id}`}
              className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#E2E8F0]">Document Ingestion</h1>
              <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">
                Step 5 of 12 — Document Ingestion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleTrigger}
              disabled={triggering || isRunning}
              className="glass-elevated px-4 py-2 text-sm font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {triggering ? 'Running...' : isRunning ? 'Ingesting...' : 'Run Ingestion'}
            </button>

            {isRunning && (
              <span className="glass-blue-tint px-3 py-1.5 text-xs text-[#1565C0] font-medium rounded-lg backdrop-blur-xl">
                Running
              </span>
            )}
            {isCompleted && (
              <span className="glass-blue-tint px-3 py-1.5 text-xs text-[#4CAF50] font-medium rounded-lg backdrop-blur-xl">
                Complete
              </span>
            )}
            {isFailed && (
              <span className="glass-surface px-3 py-1.5 text-xs text-[#ef5350] font-medium rounded-lg backdrop-blur-xl">
                Failed
              </span>
            )}
            {isNotStarted && (
              <span className="glass-surface px-3 py-1.5 text-xs text-[#94A3B8] font-medium rounded-lg backdrop-blur-xl">
                Not Started
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="glass-surface border-x-0 border-b border-[rgba(97,145,211,0.25)] rounded-none">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#1565C0] border-[#1565C0]'
                    : 'text-[#94A3B8] border-transparent hover:text-[#E2E8F0] hover:border-[#2A4A6B]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-elevated p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#E2E8F0]">Pipeline Progress</h2>
                <span className="text-sm text-[#1565C0] font-[family-name:var(--font-body)]">
                  {overallProgress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[rgba(97,145,211,0.15)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isFailed
                      ? 'bg-[#ef5350]'
                      : isCompleted
                        ? 'bg-[#4CAF50]'
                        : 'bg-[#1565C0]'
                  }`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs text-[#64748b] mt-2">
                {completedCount} of {PIPELINE_STAGES.length} stages complete
                {isRunning && ' — polling for updates...'}
              </p>
            </div>

            <div className="space-y-3">
              {PIPELINE_STAGES.map((stage, index) => {
                const stageData = stageMap.get(stage.key);
                const stageStatus: StageData['status'] = stageData?.status ?? 'pending';
                const isLast = index === PIPELINE_STAGES.length - 1;

                return (
                  <div key={stage.key}>
                    <div className="glass-surface p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              stageStatus === 'completed'
                                ? 'bg-[#4CAF50]/20 text-[#4CAF50]'
                                : stageStatus === 'running'
                                  ? 'bg-[#1565C0]/20 text-[#1565C0]'
                                  : stageStatus === 'failed'
                                    ? 'bg-[#ef5350]/20 text-[#ef5350]'
                                    : 'bg-[rgba(97,145,211,0.1)] text-[#64748b]'
                            }`}
                          >
                            {index + 1}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-px h-6 mt-1 ${
                                stageStatus === 'completed' ? 'bg-[#4CAF50]/30' : 'bg-[rgba(97,145,211,0.15)]'
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <StageIndicator status={stageStatus} />
                              <span className="text-sm font-medium text-[#E2E8F0]">
                                {stage.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {stageData?.duration != null && stageData.duration > 0 && (
                                <span className="text-xs text-[#64748b] font-[family-name:var(--font-body)]">
                                  {formatDuration(stageData.duration)}
                                </span>
                              )}
                              {stageData?.inputCount != null && (
                                <span className="text-xs text-[#64748b]">
                                  {stageData.inputCount} → {stageData.outputCount ?? 0}
                                </span>
                              )}
                            </div>
                          </div>

                          {stageStatus === 'running' && (
                            <div className="mt-2">
                              <ProgressBar status={stageStatus} />
                            </div>
                          )}

                          {stageStatus === 'failed' && stageData?.errors && stageData.errors.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {stageData.errors.map((err, i) => (
                                <p key={i} className="text-xs text-[#ef5350] bg-[#ef5350]/10 px-3 py-1.5 rounded">
                                  {err}
                                </p>
                              ))}
                            </div>
                          )}

                          {stageData?.started_at && (
                            <div className="mt-1 text-xs text-[#64748b]">
                              Started: {new Date(stageData.started_at).toLocaleTimeString()}
                              {stageData.completed_at && (
                                <> — Completed: {new Date(stageData.completed_at).toLocaleTimeString()}</>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="glass-surface p-4 border-[#ef5350]">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#ef5350] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[#ef5350]">Trigger Failed</p>
                    <p className="text-xs text-[#94A3B8] mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {status?.meta && (
              <div className="glass-surface p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[#f59e0b]">Degraded Mode</p>
                    <p className="text-xs text-[#94A3B8] mt-1">{status.meta.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {summary && (
              <div className="glass-elevated p-6">
                <h3 className="text-sm font-medium text-[#94A3B8] mb-4 uppercase tracking-wider">
                  Ingestion Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Candidates</span>
                    <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">{summary.candidates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Documents</span>
                    <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">{summary.documents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Chunks</span>
                    <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">{summary.chunks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Embeddings</span>
                    <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">{summary.embeddings}</span>
                  </div>
                  <div className="border-t border-[rgba(97,145,211,0.25)] pt-3 flex justify-between">
                    <span className="text-[#64748b]">Sufficiency Pass</span>
                    <span className="text-[#4CAF50] font-[family-name:var(--font-body)]">{summary.sufficiencyPassCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Sufficiency Fail</span>
                    <span className="text-[#ef5350] font-[family-name:var(--font-body)]">{summary.sufficiencyFailCount}</span>
                  </div>
                  <div className="border-t border-[rgba(97,145,211,0.25)] pt-3 flex justify-between">
                    <span className="text-[#64748b]">Total Duration</span>
                    <span className="text-[#1565C0] font-[family-name:var(--font-body)]">{formatDuration(summary.duration)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-surface p-6">
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4 uppercase tracking-wider">
                Run Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Project</span>
                  <span className="text-[#E2E8F0] font-[family-name:var(--font-body)] truncate max-w-[160px]">{id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Run ID</span>
                  <span className="text-[#94A3B8] font-[family-name:var(--font-body)] truncate max-w-[160px]">
                    {status?.runId ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Status</span>
                  <span
                    className={`text-sm font-medium ${
                      isRunning
                        ? 'text-[#1565C0]'
                        : isCompleted
                          ? 'text-[#4CAF50]'
                          : isFailed
                            ? 'text-[#ef5350]'
                            : 'text-[#94A3B8]'
                    }`}
                  >
                    {isRunning ? 'Running' : isCompleted ? 'Complete' : isFailed ? 'Failed' : 'Not Started'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-surface p-6">
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4 uppercase tracking-wider">
                Next Steps
              </h3>
              <div className="space-y-3">
                {isCompleted ? (
                  <>
                    <Link
                      href={`/projects/${id}/bom`}
                      className="glass-elevated flex items-center gap-3 p-3 hover:scale-[1.01] transition-transform"
                    >
                      <div className="w-8 h-8 glass-blue-tint flex items-center justify-center rounded">
                        <svg className="w-4 h-4 text-[#6191D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#E2E8F0]">Generate BOM</p>
                        <p className="text-xs text-[#64748b]">Build bill of materials</p>
                      </div>
                    </Link>
                    <Link
                      href={`/projects/${id}/architecture`}
                      className="glass-surface flex items-center gap-3 p-3 hover:scale-[1.01] transition-transform"
                    >
                      <div className="w-8 h-8 glass-surface flex items-center justify-center rounded">
                        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#94A3B8]">Review Architecture</p>
                        <p className="text-xs text-[#64748b]">Check hardware template</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/projects/${id}/architecture`}
                    className="glass-elevated flex items-center gap-3 p-3 hover:scale-[1.01] transition-transform"
                  >
                    <div className="w-8 h-8 glass-surface flex items-center justify-center rounded">
                      <svg className="w-4 h-4 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#E2E8F0]">Select Architecture First</p>
                      <p className="text-xs text-[#64748b]">Required before ingestion</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
