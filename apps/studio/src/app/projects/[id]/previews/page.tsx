'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { mockProjects } from '@/lib/mock-data';
import StatusBadge from '@/components/StatusBadge';

function SchematicPlaceholder() {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <rect width="800" height="600" fill="#0f0f16" />
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#grid)" />

      <g stroke="#00f0ff" strokeWidth="2" fill="none" opacity="0.6">
        <rect x="100" y="100" width="120" height="80" rx="4" />
        <text
          x="160"
          y="145"
          textAnchor="middle"
          fill="#00f0ff"
          stroke="none"
          fontSize="14"
          fontFamily="monospace"
        >
          U1
        </text>

        <rect x="300" y="80" width="100" height="60" rx="4" />
        <text
          x="350"
          y="115"
          textAnchor="middle"
          fill="#00f0ff"
          stroke="none"
          fontSize="12"
          fontFamily="monospace"
        >
          R1
        </text>

        <rect x="300" y="180" width="100" height="60" rx="4" />
        <text
          x="350"
          y="215"
          textAnchor="middle"
          fill="#00f0ff"
          stroke="none"
          fontSize="12"
          fontFamily="monospace"
        >
          C1
        </text>

        <circle cx="500" cy="140" r="40" />
        <text
          x="500"
          y="145"
          textAnchor="middle"
          fill="#00f0ff"
          stroke="none"
          fontSize="12"
          fontFamily="monospace"
        >
          L1
        </text>

        <line x1="220" y1="140" x2="300" y2="110" />
        <line x1="220" y1="140" x2="300" y2="210" />
        <line x1="400" y1="110" x2="460" y2="140" />
        <line x1="540" y1="140" x2="600" y2="140" />
        <line x1="600" y1="140" x2="600" y2="300" />
        <line x1="400" y1="210" x2="400" y2="350" />
        <line x1="100" y1="140" x2="50" y2="140" />
        <line x1="50" y1="140" x2="50" y2="400" />
      </g>

      <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
        Schematic Preview (SVG Placeholder)
      </text>
    </svg>
  );
}

function PCB2DPlaceholder() {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      <rect width="800" height="600" fill="#1a1a25" />

      <rect
        x="200"
        y="150"
        width="400"
        height="300"
        rx="8"
        fill="#0f3d0f"
        stroke="#22c55e"
        strokeWidth="2"
      />

      <g fill="#22c55e" opacity="0.8">
        <circle cx="250" cy="200" r="8" />
        <circle cx="300" cy="200" r="8" />
        <circle cx="350" cy="200" r="8" />
        <circle cx="450" cy="200" r="8" />
        <circle cx="500" cy="200" r="8" />
        <circle cx="550" cy="200" r="8" />

        <circle cx="250" cy="400" r="8" />
        <circle cx="300" cy="400" r="8" />
        <circle cx="350" cy="400" r="8" />
        <circle cx="450" cy="400" r="8" />
        <circle cx="500" cy="400" r="8" />
        <circle cx="550" cy="400" r="8" />

        <rect x="380" y="280" width="40" height="40" rx="4" />
        <rect x="320" y="320" width="60" height="30" rx="2" />
        <rect x="420" y="250" width="50" height="40" rx="2" />
      </g>

      <g stroke="#eab308" strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M 250 200 L 300 200 L 350 250 L 400 300" />
        <path d="M 450 200 L 500 250 L 450 300 L 400 300" />
        <path d="M 550 200 L 550 350 L 500 400" />
        <path d="M 250 400 L 300 400 L 340 350" />
      </g>

      <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
        PCB 2D Preview - Top Layer (SVG Placeholder)
      </text>
    </svg>
  );
}

function PCB3DPlaceholder() {
  return (
    <svg viewBox="0 0 800" className="w-full h-full">
      <defs>
        <linearGradient id="board3d" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3a1a" />
          <stop offset="50%" stopColor="#0f2d0f" />
          <stop offset="100%" stopColor="#1a3a1a" />
        </linearGradient>
        <linearGradient id="sideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d5a2d" />
          <stop offset="100%" stopColor="#0f2d0f" />
        </linearGradient>
      </defs>

      <rect width="800" height="600" fill="#0a0a0f" />

      <g transform="translate(400, 300)">
        <path
          d="M -150 -100 L 150 -100 L 180 0 L 150 100 L -150 100 L -180 0 Z"
          fill="url(#board3d)"
          stroke="#22c55e"
          strokeWidth="2"
        />

        <path d="M -150 100 L -150 120 L 150 120 L 150 100" fill="url(#sideGradient)" />
        <path d="M 150 100 L 180 0 L 180 20 L 150 120" fill="#0f3d0f" />

        <g fill="#22c55e" opacity="0.9">
          <circle cx="-100" cy="-50" r="6" />
          <circle cx="-50" cy="-50" r="6" />
          <circle cx="0" cy="-50" r="6" />
          <circle cx="100" cy="-50" r="6" />

          <circle cx="-100" cy="50" r="6" />
          <circle cx="-50" cy="50" r="6" />
          <circle cx="50" cy="50" r="6" />
          <circle cx="100" cy="50" r="6" />

          <rect x="-20" y="-20" width="40" height="40" rx="3" />
          <rect x="-60" y="20" width="30" height="20" rx="2" />
        </g>

        <rect x="-30" y="-110" width="60" height="15" rx="2" fill="#64748b" />
        <rect x="-30" y="-120" width="50" height="15" rx="2" fill="#8b5cf6" />
      </g>

      <text x="400" y="550" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">
        PCB 3D Preview (SVG Placeholder)
      </text>
    </svg>
  );
}

export default function PreviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'schematic' | 'pcb2d' | 'pcb3d'>('schematic');
  const project = mockProjects.find((p) => p.id === id);

  const tabs = [
    { id: 'overview', label: 'Overview', href: `/projects/${id}` },
    { id: 'intake', label: 'Intake', href: `/projects/${id}/intake` },
    { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
    { id: 'previews', label: 'Previews', href: `/projects/${id}/previews`, active: true },
    { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
    { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
  ];

  const viewTabs = [
    { id: 'schematic', label: 'Schematic' },
    { id: 'pcb2d', label: 'PCB 2D' },
    { id: 'pcb3d', label: 'PCB 3D' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#27273a] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
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
              <h1 className="text-xl font-bold text-[#e4e4e7]">Design Previews</h1>
              <p className="text-xs text-[#a1a1aa] font-mono">{id}</p>
            </div>
          </div>
          {project && <StatusBadge status={project.status} />}
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
        <div className="card overflow-hidden">
          <div className="border-b border-[#27273a] px-6 py-4">
            <div className="flex gap-6">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`text-sm font-medium transition-all pb-2 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-[#00f0ff] border-[#00f0ff]'
                      : 'text-[#a1a1aa] border-transparent hover:text-[#e4e4e7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="aspect-video bg-[#0a0a0f]">
            {activeTab === 'schematic' && <SchematicPlaceholder />}
            {activeTab === 'pcb2d' && <PCB2DPlaceholder />}
            {activeTab === 'pcb3d' && <PCB3DPlaceholder />}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[#a1a1aa] mb-2">Schematic</h3>
            <p className="text-xs text-[#64748b]">
              Circuit diagram showing all components and their connections.
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[#a1a1aa] mb-2">PCB 2D</h3>
            <p className="text-xs text-[#64748b]">
              Top and bottom layer views with copper traces and component placements.
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[#a1a1aa] mb-2">PCB 3D</h3>
            <p className="text-xs text-[#64748b]">
              Interactive 3D model showing the physical board with components.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
