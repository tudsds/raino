import { prisma } from '@raino/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge, { type Status } from '@/components/StatusBadge';

interface ArchitecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchitecturePage({ params }: ArchitecturePageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { architecture: true },
  });

  if (!project) {
    notFound();
  }

  const architecture = project.architecture;

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
    {
      id: 'architecture',
      label: 'Architecture',
      href: `/projects/${id}/architecture`,
      active: true,
    },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

  const templateName = architecture?.templateName ?? 'Not selected';
  const mcu = architecture?.mcu ?? 'Not selected';
  const power = architecture?.power ?? 'Not selected';
  const interfaces = Array.isArray(architecture?.interfaces)
    ? (architecture.interfaces as Array<{ name: string; count: number; description: string }>)
    : [];
  const features = Array.isArray(architecture?.features) ? (architecture.features as string[]) : [];

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
              <h1 className="text-xl font-bold text-[#e4e4e7]">Architecture</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] text-xs text-[#00f0ff] font-medium">
              {templateName}
            </span>
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
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">MCU Selection</h2>
              {architecture ? (
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00f0ff]/20 to-[#8b5cf6]/20 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-[#00f0ff]"
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
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#e4e4e7]">{mcu}</h3>
                    </div>
                    {architecture.rationale && (
                      <p className="text-[#a1a1aa] text-sm whitespace-pre-wrap">
                        {architecture.rationale}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#64748b]">No architecture selected yet.</p>
                  <p className="text-sm text-[#a1a1aa] mt-2">Complete the spec phase first.</p>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Power Topology</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Topology</p>
                  <p className="text-[#e4e4e7] font-medium">{power}</p>
                </div>
                <div className="p-4 bg-[#1a1a2e] border border-[#27273a]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">MCU</p>
                  <p className="text-[#e4e4e7] font-medium">{mcu}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Interfaces
              </h3>
              <div className="space-y-3">
                {interfaces.map((iface, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#1a1a2e] border border-[#27273a]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#00f0ff] font-mono text-sm font-medium">
                        {iface.name}
                      </span>
                      <span className="text-[#64748b] text-xs">x{iface.count}</span>
                    </div>
                    <span className="text-[#a1a1aa] text-xs">{iface.description}</span>
                  </div>
                ))}
                {interfaces.length === 0 && (
                  <p className="text-[#64748b] text-sm">No interfaces defined yet.</p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Supported Features
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center flex-shrink-0">
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
                    <span className="text-[#a1a1aa] text-sm">{feature}</span>
                  </li>
                ))}
                {features.length === 0 && (
                  <p className="text-[#64748b] text-sm">No features defined yet.</p>
                )}
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium text-[#a1a1aa] mb-4 uppercase tracking-wider">
                Template
              </h3>
              <div className="p-4 bg-gradient-to-br from-[#00f0ff]/10 to-[#8b5cf6]/10 border border-[#00f0ff]/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-[#00f0ff]"
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
                  <span className="text-[#e4e4e7] font-medium">{templateName}</span>
                </div>
                <p className="text-xs text-[#64748b]">
                  {architecture
                    ? 'Architecture template selected for this project'
                    : 'No template selected yet'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
