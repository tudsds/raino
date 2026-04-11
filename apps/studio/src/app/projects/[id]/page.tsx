import { mockProjects } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import WorkflowProgress from '@/components/WorkflowProgress';
import NeonButton from '@/components/NeonButton';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}`, active: true },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
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
              <h1 className="text-xl font-bold text-[#e4e4e7]">{project.name}</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{project.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={project.status} />
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
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Description</h2>
              <p className="text-[#a1a1aa]">{project.description}</p>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Workflow Progress</h2>
              <WorkflowProgress
                progress={Math.round((project.currentStep / project.totalSteps) * 100)}
                showSteps
              />
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00f0ff] mt-2" />
                  <div>
                    <p className="text-sm text-[#e4e4e7]">Project created</p>
                    <p className="text-xs text-[#64748b]">
                      {new Date(project.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {project.currentStep > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-2" />
                    <div>
                      <p className="text-sm text-[#e4e4e7]">Intake completed</p>
                      <p className="text-xs text-[#64748b]">Specification generated</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Status</span>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Progress</span>
                  <span className="text-[#00f0ff] font-mono">
                    {Math.round((project.currentStep / project.totalSteps) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Created</span>
                  <span className="text-[#e4e4e7]">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Updated</span>
                  <span className="text-[#e4e4e7]">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href={`/projects/${id}/intake`}>
                  <NeonButton variant="secondary" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Continue Intake
                  </NeonButton>
                </Link>
                <Link href={`/projects/${id}/quote`}>
                  <NeonButton variant="secondary" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    View Quote
                  </NeonButton>
                </Link>
                <Link href={`/projects/${id}/downloads`}>
                  <NeonButton variant="secondary" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Files
                  </NeonButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
