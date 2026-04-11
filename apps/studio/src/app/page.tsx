'use client';

import Link from 'next/link';
import { useState } from 'react';
import { mockProjects } from '@/lib/mock-data';
import StatusBadge from '@/components/StatusBadge';
import NeonButton from '@/components/NeonButton';
import WorkflowProgress from '@/components/WorkflowProgress';

export default function DashboardPage() {
  const [projects, setProjects] = useState(mockProjects);

  const handleNewProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: `New Project ${projects.length + 1}`,
      description: 'Describe your hardware idea...',
      status: 'draft' as const,
      currentStep: 0,
      totalSteps: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Raino Studio</h1>
              <p className="text-xs text-[#a1a1aa]">Agentic PCB Design Platform</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-[#e4e4e7] hover:text-[#00f0ff] transition-colors">
              Dashboard
            </Link>
            <Link href="/docs" className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
              Documentation
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-[#27273a]" />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#e4e4e7] mb-2">Your Projects</h2>
          <p className="text-[#a1a1aa] mb-6">
            Manage your PCB designs from concept to manufacturing
          </p>
          <NeonButton onClick={handleNewProject}>+ New Project</NeonButton>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[#13131f] border border-[#27273a] flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#3a3a5a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#e4e4e7] mb-2">No projects yet</h3>
            <p className="text-[#a1a1aa] max-w-md mx-auto">
              Start your first PCB design project. Describe your hardware idea in natural language
              and let Raino guide you through the workflow.
            </p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card card-hover-glow group block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#8b5cf6]/20 border border-[#00f0ff]/30 flex items-center justify-center group-hover:border-[#00f0ff]/60 transition-colors">
                      <svg
                        className="w-6 h-6 text-[#00f0ff]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                        />
                      </svg>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  <h3 className="text-lg font-semibold text-[#e4e4e7] mb-2 group-hover:text-[#00f0ff] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-[#a1a1aa] mb-4 line-clamp-2">{project.description}</p>

                  <WorkflowProgress
                    progress={Math.round((project.currentStep / project.totalSteps) * 100)}
                  />

                  <div className="mt-4 pt-4 border-t border-[#27273a] flex items-center justify-between text-xs text-[#64748b]">
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    <span className="font-mono">{project.id}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
