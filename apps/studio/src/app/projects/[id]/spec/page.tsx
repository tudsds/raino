'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch {
        // project data unavailable — show not found
      }
    }
    loadProject();
  }, [id]);

  if (!project) {
    notFound();
  }

  const requirements: string[] = Array.isArray(project.spec?.requirements)
    ? (project.spec.requirements as string[])
    : [];
  const isCompiled = requirements.length > 0 || !!project.spec?.rawText;

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
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${id}`}
              className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
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
              <h1 className="text-xl font-bold text-[#e4e4e7]">Specification</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isCompiled ? (
              <span className="px-3 py-1.5 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] text-xs text-[#22c55e] font-medium">
                Compiled
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-xs text-[#f59e0b] font-medium">
                Pending
              </span>
            )}
            <StatusBadge status={project.status as Status} />
          </div>
        </div>
      </header>

      <div className="border-b border-[#27273a] bg-[#13131f]/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  tab.active
                    ? 'text-[#00f0ff] border-[#00f0ff]'
                    : 'text-[#a1a1aa] border-transparent hover:text-[#e4e4e7] hover:border-[#3a3a5a]'
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
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Compiled Requirements</h2>
              {requirements.length > 0 ? (
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
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
                      <span className="text-[#a1a1aa]">{req}</span>
                    </li>
                  ))}
                </ul>
              ) : project.spec?.rawText ? (
                <div className="text-[#a1a1aa] whitespace-pre-wrap">{project.spec.rawText}</div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#64748b]">No requirements compiled yet.</p>
                  <p className="text-sm text-[#a1a1aa] mt-2">
                    Complete the intake process to generate specifications.
                  </p>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Specification Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#27273a]">
                  <span className="text-[#a1a1aa]">Compilation Status</span>
                  <span
                    className={`text-sm font-medium ${
                      isCompiled ? 'text-[#22c55e]' : 'text-[#f59e0b]'
                    }`}
                  >
                    {isCompiled ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#27273a]">
                  <span className="text-[#a1a1aa]">Requirements Extracted</span>
                  <span className="text-[#00f0ff] font-mono">{requirements.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#27273a]">
                  <span className="text-[#a1a1aa]">Ready for Architecture</span>
                  <span
                    className={`text-sm font-medium ${
                      isCompiled ? 'text-[#22c55e]' : 'text-[#64748b]'
                    }`}
                  >
                    {isCompiled ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Project Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Project Name</span>
                  <span className="text-[#e4e4e7]">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Status</span>
                  <StatusBadge status={project.status as Status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Progress</span>
                  <span className="text-[#00f0ff] font-mono">
                    {Math.round((project.currentStep / project.totalSteps) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Next Steps
              </h3>
              <div className="space-y-3">
                {isCompiled ? (
                  <>
                    <Link
                      href={`/projects/${id}/architecture`}
                      className="flex items-center gap-3 p-3 bg-[rgba(0,240,255,0.05)] border border-[rgba(0,240,255,0.2)] hover:border-[#00f0ff] transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#0a0a0f]"
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
                        <p className="text-sm font-medium text-[#e4e4e7]">Select Architecture</p>
                        <p className="text-xs text-[#64748b]">Choose hardware template</p>
                      </div>
                    </Link>
                    <Link
                      href={`/projects/${id}/bom`}
                      className="flex items-center gap-3 p-3 bg-[#1a1a2e] border border-[#27273a] hover:border-[#3a3a5a] transition-colors"
                    >
                      <div className="w-8 h-8 bg-[#27273a] flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#a1a1aa]"
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
                        <p className="text-sm font-medium text-[#a1a1aa]">View BOM</p>
                        <p className="text-xs text-[#64748b]">Bill of Materials</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/projects/${id}/intake`}
                    className="flex items-center gap-3 p-3 bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] hover:border-[#f59e0b] transition-colors"
                  >
                    <div className="w-8 h-8 bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center">
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
                      <p className="text-sm font-medium text-[#e4e4e7]">Complete Intake</p>
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
