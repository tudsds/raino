import { redirect } from 'next/navigation';
import { getAdapterStatus } from '@raino/supplier-clients';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Badge } from '@raino/ui';

interface IntegrationStatus {
 name: string;
 key: string;
 status: 'live' | 'mock' | 'error' | 'unavailable';
 description: string;
}

function StatusDot({ status }: { status: IntegrationStatus['status'] }) {
 const colors = {
 live: 'bg-[#4CAF50] shadow-[0_0_8px_rgba(76, 175, 80,0.8)]',
 mock: 'bg-[#FF9800] shadow-[0_0_8px_rgba(255, 152, 0,0.8)]',
 error: 'bg-[#EF5350] shadow-[0_0_8px_rgba(239, 83, 80,0.8)]',
 unavailable: 'bg-[#64748B]',
 };

 return <span className={`inline-block w-3 h-3 ${colors[status]}`} />;
}

function StatusBadge({ status }: { status: IntegrationStatus['status'] }) {
 const configs = {
 live: { label: 'Live', variant: 'success' as const },
 mock: { label: 'Fixture', variant: 'warning' as const },
 error: { label: 'Error', variant: 'error' as const },
 unavailable: { label: 'Unavailable', variant: 'default' as const },
 };
 const config = configs[status];
 return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default async function SettingsPage() {
 const user = await getCurrentUser();

 const hasSupabase =
 !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

 if (!user && hasSupabase) redirect('/login');

 const adapterStatus = getAdapterStatus();
 const hasKimi = !!process.env.KIMI_API_KEY;

 const integrations: IntegrationStatus[] = [
 {
 name: 'Kimi K2.5',
 key: 'kimi',
 status: hasKimi ? 'live' : 'mock',
 description: hasKimi ? 'Using live Moonshot API' : 'LLM calls use fixture responses',
 },
 {
 name: 'Supabase',
 key: 'supabase',
 status: hasSupabase ? 'live' : 'unavailable',
 description: hasSupabase
 ? 'Auth, Postgres, and Storage connected'
 : 'Running in degraded mode — no persistence',
 },
 {
 name: 'DigiKey',
 key: 'digikey',
 status: adapterStatus.digikey.mode === 'live' ? 'live' : 'mock',
 description:
 adapterStatus.digikey.mode === 'live'
 ? 'Live pricing and stock data'
 : 'Using fixture pricing estimates',
 },
 {
 name: 'Mouser',
 key: 'mouser',
 status: adapterStatus.mouser.mode === 'live' ? 'live' : 'mock',
 description:
 adapterStatus.mouser.mode === 'live'
 ? 'Live pricing and stock data'
 : 'Using fixture pricing estimates',
 },
 {
 name: 'JLCPCB',
 key: 'jlcpcb',
 status: adapterStatus.jlcpcb.mode === 'live' ? 'live' : 'mock',
 description:
 adapterStatus.jlcpcb.mode === 'live'
 ? 'Live PCBA quote and assembly data'
 : 'Using fixture quote estimates',
 },
 ];

 return (
 <div className="min-h-screen bg-[#0A1929]">
 <main className="max-w-5xl mx-auto px-6 py-8">
 <div className="mb-10">
 <h2 className="text-3xl font-bold text-[#E2E8F0] mb-2 font-[family-name:var(--font-heading)]">
 Settings
 </h2>
 <p className="text-[#94A3B8] font-[family-name:var(--font-body)]">
 Manage your account and integration preferences
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-1">
 <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl p-6 sticky top-24">
 <h3
 className="text-[#E2E8F0] font-[family-name:var(--font-heading)] uppercase tracking-wider mb-6"
 style={{ fontSize: '0.7rem' }}
 >
 Profile
 </h3>

 <div className="flex flex-col items-center text-center mb-6">
 <div className="w-20 h-20 bg-gradient-to-br from-[#1565C0] to-[#6191D3] flex items-center justify-center mb-4">
 <span className="text-[#0A1929] text-2xl font-bold font-[family-name:var(--font-heading)]">
 {user?.email?.charAt(0).toUpperCase() ?? '?'}
 </span>
 </div>
 <p className="text-[#E2E8F0] font-[family-name:var(--font-body)] text-lg break-all">
 {user?.email ?? 'Guest'}
 </p>
 <p className="text-[#64748B] font-[family-name:var(--font-body)] text-base mt-1">
 {hasSupabase ? 'Authenticated' : 'Local Mode'}
 </p>
 </div>

 <div className="border-t border-white/[0.12] pt-4 space-y-3">
 <div className="flex justify-between text-sm">
 <span className="text-[#64748B] font-[family-name:var(--font-body)]">
 User ID
 </span>
 <span className="text-[#E2E8F0] font-[family-name:var(--font-body)] text-xs truncate max-w-[140px]">
 {user?.id ?? '—'}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-[#64748B] font-[family-name:var(--font-body)]">
 Provider
 </span>
 <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">
 {user?.app_metadata?.provider ?? 'magic_link'}
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="lg:col-span-2 space-y-8">
 <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl overflow-hidden">
 <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.12]">
 <div>
 <h3
 className="text-[#E2E8F0] font-[family-name:var(--font-heading)] uppercase tracking-wider"
 style={{ fontSize: '0.7rem' }}
 >
 Integration Status
 </h3>
 <p className="text-[#64748B] text-base mt-1 font-[family-name:var(--font-body)]">
 Live connection health for all external services
 </p>
 </div>
 <div className="flex items-center gap-2">
 <StatusDot status="live" />
 <span className="text-[#4CAF50] text-sm font-[family-name:var(--font-body)]">
 {integrations.filter((i) => i.status === 'live').length} live
 </span>
 <span className="text-[#64748B] mx-1">/</span>
 <StatusDot status="mock" />
 <span className="text-[#FF9800] text-sm font-[family-name:var(--font-body)]">
 {integrations.filter((i) => i.status === 'mock').length} fixture
 </span>
 </div>
 </div>

 <div className="divide-y divide-white/[0.12]">
 {integrations.map((integration) => (
 <div
 key={integration.key}
 className="flex items-center justify-between px-6 py-4 hover:bg-[#132F4C]/30 transition-colors"
 >
 <div className="flex items-center gap-4">
 <StatusDot status={integration.status} />
 <div>
 <p className="text-[#E2E8F0] font-[family-name:var(--font-body)] text-lg">
 {integration.name}
 </p>
 <p className="text-[#64748B] font-[family-name:var(--font-body)] text-base">
 {integration.description}
 </p>
 </div>
 </div>
 <StatusBadge status={integration.status} />
 </div>
 ))}
 </div>
 </div>

 <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl overflow-hidden">
 <div className="px-6 py-4 border-b border-white/[0.12]">
 <h3
 className="text-[#E2E8F0] font-[family-name:var(--font-heading)] uppercase tracking-wider"
 style={{ fontSize: '0.7rem' }}
 >
 System Info
 </h3>
 </div>
 <div className="p-6 space-y-4">
 <div className="flex justify-between text-sm">
 <span className="text-[#64748B] font-[family-name:var(--font-body)]">
 App Version
 </span>
 <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">0.1.0</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-[#64748B] font-[family-name:var(--font-body)]">
 Environment
 </span>
 <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">
 {process.env.NODE_ENV ?? 'development'}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-[#64748B] font-[family-name:var(--font-body)]">
 Embedding Provider
 </span>
 <span className="text-[#E2E8F0] font-[family-name:var(--font-body)]">
 {process.env.EMBEDDING_PROVIDER ?? 'mock'}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}
