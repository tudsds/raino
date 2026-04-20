import Link from 'next/link';
import { getProjectsForUser } from '@/lib/data/project-queries';
import { getAdapterStatus } from '@raino/supplier-clients';
import StatusBadge, { type Status } from '@/components/StatusBadge';
import NeonButton from '@/components/NeonButton';
import WorkflowProgress from '@/components/WorkflowProgress';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!user && hasSupabase) redirect('/login');

  const projects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    currentStep: number;
    totalSteps: number;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  try {
    if (user) {
      const dbProjects = await getProjectsForUser(user.id);
      for (const project of dbProjects) {
        projects.push({
          id: project.id,
          name: project.name,
          description: project.description ?? null,
          status: project.status,
          currentStep: project.current_step ?? 1,
          totalSteps: project.total_steps ?? 12,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
        });
      }
    }
  } catch {
    // intentional — projects remain empty
  }

  const adapterStatus = getAdapterStatus();
  const hasKimi = !!process.env.KIMI_API_KEY;

  const integrationStatuses = [
    { name: 'Kimi', status: hasKimi ? 'live' : ('mock' as const) },
    { name: 'Supabase', status: hasSupabase ? 'live' : ('unavailable' as const) },
    { name: 'DigiKey', status: adapterStatus.digikey.mode === 'live' ? 'live' : ('mock' as const) },
    { name: 'Mouser', status: adapterStatus.mouser.mode === 'live' ? 'live' : ('mock' as const) },
    { name: 'JLCPCB', status: adapterStatus.jlcpcb.mode === 'live' ? 'live' : ('mock' as const) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] circuit-grid">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {integrationStatuses.map((integration) => (
              <Link
                key={integration.name}
                href="/settings"
                className="flex items-center gap-2 px-3 py-1.5 bg-[#111118] border-2 border-[#27272a] hover:border-[#3f3f46] transition-colors"
              >
                <span
                  className={`inline-block w-2.5 h-2.5 ${
                    integration.status === 'live'
                      ? 'bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.8)]'
                      : integration.status === 'mock'
                        ? 'bg-[#ffaa00] shadow-[0_0_6px_rgba(255,170,0,0.8)]'
                        : 'bg-[#71717a]'
                  }`}
                />
                <span className="text-xs text-[#a1a1aa] font-[family-name:var(--font-body)]">
                  {integration.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#e4e4e7] mb-2 font-[family-name:var(--font-heading)]">
            Your Projects
          </h2>
          <p className="text-[#a1a1aa] mb-6 font-[family-name:var(--font-body)]">
            Manage your PCB designs from concept to manufacturing
          </p>
          <Link href="/projects/new" className="inline-block">
            <NeonButton>+ New Project</NeonButton>
          </Link>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#111118] border border-[#27273a] flex items-center justify-center">
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
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#e4e4e7] mb-2 font-[family-name:var(--font-heading)]">
              No projects yet
            </h3>
            <p className="text-[#a1a1aa] max-w-md mx-auto font-[family-name:var(--font-body)]">
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
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00f0ff]/20 to-[#8b5cf6]/20 border border-[#00f0ff]/30 flex items-center justify-center group-hover:border-[#00f0ff]/60 transition-colors">
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
                    <StatusBadge status={project.status as Status} />
                  </div>

                  <h3 className="text-lg font-semibold text-[#e4e4e7] mb-2 group-hover:text-[#00f0ff] transition-colors font-[family-name:var(--font-heading)]">
                    {project.name}
                  </h3>
                  <p className="text-sm text-[#a1a1aa] mb-4 line-clamp-2 font-[family-name:var(--font-body)]">
                    {project.description}
                  </p>

                  <WorkflowProgress
                    progress={Math.round((project.currentStep / project.totalSteps) * 100)}
                  />

                  <div className="mt-4 pt-4 border-t border-[#27273a] flex items-center justify-between text-xs text-[#71717a] font-[family-name:var(--font-body)]">
                    <span>Updated {project.updatedAt.toLocaleDateString()}</span>
                    <span className="font-[family-name:var(--font-body)]">{project.id}</span>
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
