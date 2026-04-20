'use client';
import Link from 'next/link';
import WorkflowProgress from '@/components/WorkflowProgress';
import StatusBadge, { type Status } from '@/components/StatusBadge';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: Status;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
  };
}

interface ProjectDetailProps {
  project: Project;
}

const workflowSteps = [
  { key: 'intake', label: 'Intake', description: 'Describe your project requirements', href: (id: string) => `/projects/${id}/intake` },
  { key: 'spec', label: 'Specification', description: 'AI-generated technical specification', href: (id: string) => `/projects/${id}/spec` },
  { key: 'architecture', label: 'Architecture', description: 'System architecture planning', href: (id: string) => `/projects/${id}/architecture` },
  { key: 'bom', label: 'Bill of Materials', description: 'Component sourcing and pricing', href: (id: string) => `/projects/${id}/bom` },
  { key: 'design', label: 'PCB Design', description: 'AI-driven PCB layout generation', href: (id: string) => `/projects/${id}/previews` },
  { key: 'downloads', label: 'Downloads', description: 'Gerber files and design exports', href: (id: string) => `/projects/${id}/downloads` },
  { key: 'quote', label: 'Quote', description: 'Manufacturing cost estimation', href: (id: string) => `/projects/${id}/quote` },
];

export function ProjectDetail({ project }: ProjectDetailProps) {
  const progress = project.totalSteps > 0
    ? Math.round((project.currentStep / project.totalSteps) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/"
                  className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors text-sm"
                >
                  ← Dashboard
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-[#e4e4e7] mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-[#a1a1aa] text-base max-w-2xl">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} />
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#0d0d14] border border-[#27273a] p-4 rounded-sm">
            <WorkflowProgress progress={progress} showSteps={true} />
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {workflowSteps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = project.currentStep >= stepNumber;
            const isCurrent = project.currentStep === index;
            const isAccessible = project.currentStep >= index;

            return (
              <div
                key={step.key}
                className={`border p-4 rounded-sm transition-all ${
                  isCompleted
                    ? 'border-[#00f0ff]/40 bg-[#00f0ff]/5'
                    : isCurrent
                    ? 'border-[#8b5cf6]/60 bg-[#8b5cf6]/5'
                    : 'border-[#27273a] bg-[#0d0d14]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono ${
                    isCompleted ? 'text-[#00f0ff]' : isCurrent ? 'text-[#8b5cf6]' : 'text-[#71717a]'
                  }`}>
                    STEP {stepNumber}
                  </span>
                  {isCompleted && (
                    <span className="text-[#00f0ff] text-xs">✓ Done</span>
                  )}
                  {isCurrent && (
                    <span className="text-[#8b5cf6] text-xs animate-pulse">● Active</span>
                  )}
                </div>
                <h3 className="text-[#e4e4e7] font-semibold mb-1">{step.label}</h3>
                <p className="text-[#71717a] text-xs mb-3">{step.description}</p>
                {isAccessible ? (
                  <Link
                    href={step.href(project.id)}
                    className={`inline-block text-xs px-3 py-1.5 border transition-all ${
                      isCompleted
                        ? 'border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/10'
                        : isCurrent
                        ? 'border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/10'
                        : 'border-[#27273a] text-[#a1a1aa] hover:border-[#00f0ff] hover:text-[#00f0ff]'
                    }`}
                  >
                    {isCompleted ? 'Review' : isCurrent ? 'Continue →' : 'Open'}
                  </Link>
                ) : (
                  <span className="text-xs text-[#71717a] opacity-50">Locked</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0d0d14] border border-[#27273a] p-6 rounded-sm">
          <h2 className="text-[#e4e4e7] font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/projects/${project.id}/intake`}
              className="border border-[#00f0ff] text-[#00f0ff] px-4 py-2 text-sm hover:bg-[#00f0ff] hover:text-[#0a0a0f] transition-all"
            >
              Start Intake Chat
            </Link>
            <Link
              href={`/projects/${project.id}/downloads`}
              className="border border-[#27273a] text-[#a1a1aa] px-4 py-2 text-sm hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all"
            >
              Download Files
            </Link>
            <Link
              href={`/projects/${project.id}/quote`}
              className="border border-[#27273a] text-[#a1a1aa] px-4 py-2 text-sm hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all"
            >
              Get Quote
            </Link>
          </div>
        </div>

        {/* Project Meta */}
        <div className="mt-4 flex items-center gap-6 text-xs text-[#71717a]">
          <span>ID: <code className="text-[#a1a1aa]">{project.id}</code></span>
          {project.organization && (
            <span>Org: <span className="text-[#a1a1aa]">{project.organization.name}</span></span>
          )}
          <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
