'use client';

import { GlassCard } from './GlassCard';
import { ConnectionLine } from './ConnectionLine';

export interface ArchitectureDiagramProps {
  className?: string;
}

export function ArchitectureDiagram({ className }: ArchitectureDiagramProps) {
  return (
    <div className={`flex flex-col items-center gap-0 max-w-5xl mx-auto ${className || ''}`}>
      <GlassCard className="px-8 py-4 w-full max-w-xs text-center" tint="accent" glassIntensity="elevated">
        <div className="text-white font-serif text-lg font-semibold">Users</div>
        <div className="text-[#64748B] text-xs mt-1">Engineers · Makers · Teams</div>
      </GlassCard>

      <ConnectionLine />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full items-center">
        <GlassCard className="px-6 py-4 text-center" glassIntensity="surface">
          <div className="text-white font-mono text-sm font-semibold">apps/site</div>
          <div className="text-[#6191D3] text-xs mt-1">Marketing</div>
          <div className="text-[#64748B] text-xs">Port 3000</div>
        </GlassCard>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 w-full px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1565C0]/40" />
            <span className="text-[#6191D3] text-xs font-mono whitespace-nowrap">CTA</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1565C0]/40" />
          </div>
        </div>

        <GlassCard className="px-6 py-4 text-center" glassIntensity="surface">
          <div className="text-white font-mono text-sm font-semibold">apps/studio</div>
          <div className="text-[#6191D3] text-xs mt-1">Product App</div>
          <div className="text-[#64748B] text-xs">Port 3001</div>
        </GlassCard>
      </div>

      <ConnectionLine />

      <div className="text-[#64748B] text-xs font-mono mb-1">Route Handlers + Server Actions</div>

      <ConnectionLine />

      <GlassCard className="px-8 py-5 w-full max-w-lg text-center" tint="accent" glassIntensity="elevated">
        <div className="text-white font-mono text-sm font-semibold">packages/core</div>
        <div className="text-[#6191D3] text-xs mt-2">
          Schemas · Validation · Quote Engine · Domain Logic
        </div>
      </GlassCard>

      <ConnectionLine />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {[
          { name: 'packages/db', label: 'ORM + Auth', sub: '@raino/db' },
          { name: 'packages/llm', label: 'Kimi Gateway', sub: '@raino/llm' },
          { name: 'packages/rag', label: 'Retrieval', sub: '@raino/rag' },
          { name: 'packages/agents', label: 'Orchestration', sub: '@raino/agents' },
          { name: 'packages/ui', label: 'Design System', sub: '@raino/ui' },
          { name: 'packages/kicad', label: 'KiCad CLI', sub: 'kicad-worker-client' },
          { name: 'packages/supplier', label: 'Suppliers', sub: 'supplier-clients' },
        ].map((pkg) => (
          <GlassCard key={pkg.name} className="px-4 py-3 text-center" glassIntensity="surface">
            <div className="text-white font-mono text-xs font-semibold">{pkg.name}</div>
            <div className="text-[#6191D3] text-xs mt-1">{pkg.label}</div>
            <div className="text-[#64748B] text-[10px] mt-0.5">{pkg.sub}</div>
          </GlassCard>
        ))}
      </div>

      <ConnectionLine />

      <GlassCard className="px-6 py-4 w-full" glassIntensity="surface">
        <div className="text-white font-mono text-sm font-semibold text-center mb-3">
          Worker Services
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'ingest-worker', color: '#1565C0' },
            { name: 'design-worker', color: '#6191D3' },
            { name: 'quote-worker', color: '#1565C0' },
            { name: 'audit-worker', color: '#6191D3' },
          ].map((svc) => (
            <div
              key={svc.name}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center"
            >
              <div className="text-white text-xs font-mono">{svc.name}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <ConnectionLine />

      <GlassCard className="px-6 py-5 w-full" tint="external" glassIntensity="elevated">
        <div className="text-white font-serif text-sm font-semibold text-center mb-4">
          External Boundaries
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="px-4 py-3 rounded-lg bg-[#0A1929]/60 border border-[#64748B]/[0.15] text-center">
            <div className="text-white text-xs font-mono font-semibold">Supabase</div>
            <div className="text-[#64748B] text-[10px] mt-1">Auth · Postgres · pgvector</div>
          </div>
          <div className="px-4 py-3 rounded-lg bg-[#0A1929]/60 border border-[#64748B]/[0.15] text-center">
            <div className="text-white text-xs font-mono font-semibold">KiCad CLI</div>
            <div className="text-[#64748B] text-[10px] mt-1">GPL Boundary</div>
          </div>
          <div className="px-4 py-3 rounded-lg bg-[#0A1929]/60 border border-[#64748B]/[0.15] text-center">
            <div className="text-white text-xs font-mono font-semibold">Suppliers</div>
            <div className="text-[#64748B] text-[10px] mt-1">DigiKey · Mouser · JLCPCB</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
