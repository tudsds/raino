'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge, { type Status } from '@/components/StatusBadge';

interface ProjectData {
  id: string;
  name: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  spec: {
    rawText: string | null;
    requirements: string[];
  } | null;
}

export default function SpecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [compileMessage, setCompileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch {
      // project data unavailable
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleCompile = async () => {
    setCompiling(true);
    setCompileMessage(null);
    try {
      const res = await fetch(`/api/projects/${id}/spec/compile`, { method: 'POST' });
      const contentType = res.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let streamDone = false;

        if (reader) {
          while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event = JSON.parse(line.slice(6));
                  if (event.type === 'error') {
                    throw new Error(event.error || 'Compilation failed');
                  }
                  if (event.type === 'done') {
                    streamDone = true;
                  }
                } catch (e) {
                  if (e instanceof Error) throw e;
                }
              }
            }
          }
        }

        if (!streamDone) {
          throw new Error('Spec compilation timed out — the AI service did not respond in time.');
        }
      } else {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to compile spec');
        }
      }

      setCompileMessage({ type: 'success', text: 'Specification compiled successfully.' });
      await loadProject();
    } catch (err) {
      setCompileMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to compile specification',
      });
    } finally {
      setCompiling(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-[#1565C0] text-lg mb-2">Loading specification...</div>
          <p className="text-[#64748b] text-sm">Fetching project data</p>
        </div>
      </div>
    );
  }

  interface StructuredRequirement {
    id?: string;
    category?: string;
    description: string;
    priority?: string;
    rationale?: string;
  }

  const rawReqs: unknown[] = Array.isArray(project.spec?.requirements)
    ? (project.spec.requirements as unknown[])
    : [];
  const requirements: StructuredRequirement[] = rawReqs.map((r) =>
    typeof r === 'string' ? { description: r } : (r as StructuredRequirement),
  );
  const hasValidSpec = requirements.length > 0 || (
    !!project.spec?.rawText &&
    !project.spec.rawText.includes('unavailable') &&
    !project.spec.rawText.includes('could not be reached')
  );

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec`, active: true },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

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
              <h1 className="text-xl font-bold text-[#E2E8F0]">Specification</h1>
              <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCompile}
              disabled={compiling}
              className="glass-elevated px-4 py-2 text-sm font-medium text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {compiling ? 'Compiling...' : hasValidSpec ? 'Recompile' : 'Compile Spec'}
            </button>
            {hasValidSpec ? (
              <span className="glass-blue-tint px-3 py-1.5 text-xs text-[#22c55e] font-medium rounded-lg backdrop-blur-xl">
                Compiled
              </span>
            ) : (
              <span className="glass-surface px-3 py-1.5 text-xs text-[#f59e0b] font-medium rounded-lg backdrop-blur-xl">
                Pending
              </span>
            )}
            <StatusBadge status={project.status as Status} />
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
        {compileMessage && (
          <div
            className={`mb-6 px-4 py-3 text-sm font-[family-name:var(--font-body)] glass-elevated ${
              compileMessage.type === 'success'
                ? 'border-[#4CAF50] text-[#4CAF50]'
                : 'border-[#ff4444] text-[#ff4444]'
            }`}
          >
            {compileMessage.text}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-elevated p-6">
              <h2 className="text-lg font-semibold text-[#E2E8F0] mb-4">Compiled Requirements</h2>
              {requirements.length > 0 ? (
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={req.id ?? index} className="glass-surface p-3 flex items-start gap-3">
                      <div className="glass-blue-tint w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 rounded">
                        <svg
                          className="w-3 h-3 text-[#22c55e]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[#94A3B8]">{req.description}</span>
                        {req.priority && (
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            req.priority === 'must' ? 'glass-blue-tint text-[#ef5350]' :
                            req.priority === 'should' ? 'glass-surface text-[#ffb74d]' :
                            'glass-surface text-[#64748B]'
                          }`}>{req.priority}</span>
                        )}
                        {req.category && (
                          <span className="ml-2 text-xs text-[#64748B]">[{req.category}]</span>
                        )}
                        {req.rationale && (
                          <p className="text-xs text-[#64748B] mt-1">{req.rationale}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : project.spec?.rawText ? (
                <div className="text-[#94A3B8] whitespace-pre-wrap">{project.spec.rawText}</div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#64748b]">No requirements compiled yet.</p>
                  <p className="text-sm text-[#94A3B8] mt-2">
                    Complete the intake process and click Compile Spec to generate specifications.
                  </p>
                </div>
              )}
            </div>

            <div className="glass-surface p-6">
              <h2 className="text-lg font-semibold text-[#E2E8F0] mb-4">Specification Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[rgba(97,145,211,0.25)]">
                  <span className="text-[#94A3B8]">Compilation Status</span>
                  <span
                    className={`text-sm font-medium ${
                      hasValidSpec ? 'text-[#22c55e]' : 'text-[#f59e0b]'
                    }`}
                  >
                    {hasValidSpec ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(97,145,211,0.25)]">
                  <span className="text-[#94A3B8]">Requirements Extracted</span>
                  <span className="text-[#1565C0] font-[family-name:var(--font-body)]">{requirements.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(97,145,211,0.25)]">
                  <span className="text-[#94A3B8]">Ready for Architecture</span>
                  <span
                    className={`text-sm font-medium ${
                      hasValidSpec ? 'text-[#22c55e]' : 'text-[#64748b]'
                    }`}
                  >
                    {hasValidSpec ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-surface p-6">
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4 uppercase tracking-wider">
                Project Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Project Name</span>
                  <span className="text-[#E2E8F0]">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Status</span>
                  <StatusBadge status={project.status as Status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Progress</span>
                  <span className="text-[#1565C0] font-[family-name:var(--font-body)]">
                    {Math.round((project.currentStep / project.totalSteps) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-surface p-6">
              <h3 className="text-sm font-medium text-[#94A3B8] mb-4 uppercase tracking-wider">
                Next Steps
              </h3>
              <div className="space-y-3">
                {hasValidSpec ? (
                  <>
                    <Link
                      href={`/projects/${id}/architecture`}
                      className="glass-elevated flex items-center gap-3 p-3 hover:scale-[1.01] transition-transform"
                    >
                      <div className="w-8 h-8 glass-blue-tint flex items-center justify-center rounded">
                        <svg
                          className="w-4 h-4 text-[#6191D3]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#E2E8F0]">Select Architecture</p>
                        <p className="text-xs text-[#64748b]">Choose hardware template</p>
                      </div>
                    </Link>
                    <Link
                      href={`/projects/${id}/bom`}
                      className="glass-surface flex items-center gap-3 p-3 hover:scale-[1.01] transition-transform"
                    >
                      <div className="w-8 h-8 glass-surface flex items-center justify-center rounded">
                        <svg
                          className="w-4 h-4 text-[#94A3B8]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#94A3B8]">View BOM</p>
                        <p className="text-xs text-[#64748b]">Bill of Materials</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/projects/${id}/intake`}
                    className="glass-elevated flex items-center gap-3 p-3 hover:scale-[1.01] transition-transform"
                  >
                    <div className="w-8 h-8 glass-surface flex items-center justify-center rounded">
                      <svg
                        className="w-4 h-4 text-[#f59e0b]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#E2E8F0]">Complete Intake</p>
                      <p className="text-xs text-[#64748b]">Provide more details</p>
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
