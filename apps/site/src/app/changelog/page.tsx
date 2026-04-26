import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Raino — Changelog',
	description:
		'Version history and release notes for Raino. Track new features, fixes, and architectural improvements.',
	openGraph: {
		title: 'Raino — Changelog',
		description:
			'Version history and release notes. See what is new, what changed, and what is coming next.',
		images: ['/og-image.png'],
		url: 'https://raino-site.vercel.app/changelog',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Raino — Changelog',
		description:
			'Version history and release notes. See what is new, what changed, and what is coming next.',
	},
};

const releases = [
	{
		version: '0.5.0',
		date: '2025-04-19',
		status: 'Current',
		color: '#1565C0',
		changes: [
			{
				type: 'feature',
				text: 'Added marketing site pages: Showcase, Integrations, Changelog, and Trust',
			},
			{
				type: 'feature',
				text: 'Enhanced homepage with "Loved by Engineers" testimonials section',
			},
			{
				type: 'feature',
				text: 'Added integration logos grid to homepage',
			},
			{
				type: 'improvement',
				text: 'Improved mobile navigation with hamburger menu and click-outside-to-close',
			},
			{
				type: 'improvement',
				text: 'All pages now have unique titles and Open Graph meta tags',
			},
		],
	},
	{
		version: '0.4.0',
		date: '2025-03-15',
		status: 'Released',
		color: '#4CAF50',
		changes: [
			{
				type: 'feature',
				text: 'Added Prisma ORM and Supabase persistence layer in @raino/db',
			},
			{
				type: 'feature',
				text: 'Implemented magic-link authentication via Supabase Auth',
			},
			{
				type: 'feature',
				text: 'Added Kimi K2.5 LLM gateway with structured output and retry logic',
			},
			{
				type: 'feature',
				text: 'Migrated RAG system to Supabase pgvector for embedding storage',
			},
			{
				type: 'improvement',
				text: 'Upgraded supplier clients with real API adapters + factory pattern',
			},
			{
				type: 'improvement',
				text: 'Enhanced liquid glass design system in @raino/ui',
			},
		],
	},
	{
		version: '0.3.0',
		date: '2025-02-01',
		status: 'Released',
		color: '#6191D3',
		changes: [
			{
				type: 'feature',
				text: 'Added quote-worker with confidence bands and assumption tracking',
			},
			{
				type: 'feature',
				text: 'Implemented audit-worker for provenance and trace logging',
			},
			{
				type: 'feature',
				text: 'Added DigiKey and Mouser supplier adapter interfaces',
			},
			{
				type: 'improvement',
				text: 'Refactored core schemas for stricter validation and better error messages',
			},
			{
				type: 'fix',
				text: 'Fixed BOM alternate part compatibility checking edge cases',
			},
		],
	},
	{
		version: '0.2.0',
		date: '2024-12-10',
		status: 'Released',
		color: '#FF9800',
		changes: [
			{
				type: 'feature',
				text: 'Added design-worker for KiCad project generation via CLI',
			},
			{
				type: 'feature',
				text: 'Implemented ingest-worker 8-stage document pipeline',
			},
			{
				type: 'feature',
				text: 'Added JLCPCB supplier adapter for PCB fabrication quotes',
			},
			{
				type: 'improvement',
				text: 'Replaced mock embeddings with OpenAI-compatible embedding provider',
			},
			{
				type: 'improvement',
				text: 'Expanded README documentation with multi-language support',
			},
		],
	},
	{
		version: '0.1.0',
		date: '2024-10-22',
		status: 'Released',
		color: '#1565C0',
		changes: [
			{
				type: 'feature',
				text: 'Initial release of Raino with core workflow pipeline',
			},
			{
				type: 'feature',
				text: 'Natural language intake with clarifying question loop',
			},
			{
				type: 'feature',
				text: 'Structured specification generation with validation',
			},
			{
				type: 'feature',
				text: 'Architecture template matching and constraint enforcement',
			},
			{
				type: 'feature',
				text: 'Marketing site and product studio Next.js apps',
			},
			{
				type: 'feature',
				text: 'Liquid glass design system with Noto Serif typography',
			},
		],
	},
];

const typeColors: Record<string, string> = {
	feature: '#1565C0',
	improvement: '#4CAF50',
	fix: '#FF9800',
	breaking: '#EF5350',
};

const typeLabels: Record<string, string> = {
	feature: 'Feature',
	improvement: 'Improvement',
	fix: 'Fix',
	breaking: 'Breaking',
};

export default function ChangelogPage() {
	return (
		<main className="pt-16">
			<section className="py-24 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<h1 className="text-4xl sm:text-5xl font-bold text-[#E2E8F0] mb-6">
						<span className="text-[#1565C0]">Changelog</span>
					</h1>
					<p className="text-xl text-[#94A3B8]">
						Version history and release notes. Track what is new, what changed, and what is coming
						next.
					</p>
				</div>
			</section>

			<section className="py-24 bg-[#0D2137]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="space-y-12">
						{releases.map((release) => (
							<div
								key={release.version}
								className="glass-elevated glass-specular p-8 relative"
							>
								<div className="relative z-10">
									<div
										className="absolute top-0 left-0 w-1 h-full rounded-full"
										style={{ backgroundColor: release.color }}
									/>

									<div className="mb-4 pl-4">
										<div className="flex flex-wrap items-center gap-3">
											<h2
												className="text-2xl font-bold"
												style={{ color: release.color }}
											>
												v{release.version}
											</h2>
											<span className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">{release.date}</span>
											{release.status === 'Current' && (
												<span
													className="px-2 py-1 text-xs font-[family-name:var(--font-body)] border rounded-lg"
													style={{
														color: release.color,
														borderColor: `${release.color}40`,
														backgroundColor: `${release.color}10`,
													}}
												>
													{release.status}
												</span>
											)}
										</div>
									</div>

									<ul className="space-y-3 pl-4">
										{release.changes.map((change, idx) => (
											<li key={idx} className="flex items-start gap-3">
												<span
													className="px-2 py-0.5 text-xs font-[family-name:var(--font-body)] mt-0.5 shrink-0 border rounded"
													style={{
														color: typeColors[change.type] || '#94A3B8',
														borderColor: `${typeColors[change.type] || '#94A3B8'}40`,
														backgroundColor: `${typeColors[change.type] || '#94A3B8'}10`,
													}}
												>
													{typeLabels[change.type] || change.type}
												</span>
												<span className="text-[#94A3B8]">{change.text}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 bg-[#0A1929]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] mb-6">
						Coming <span className="text-[#1565C0]">Soon</span>
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
						<div className="glass-surface glass-specular p-6">
							<div className="relative z-10">
								<h3 className="text-[#1565C0] font-semibold text-sm mb-2">
									Team Workspaces
								</h3>
								<p className="text-sm text-[#94A3B8]">
									Collaborate on hardware projects with shared specs, review workflows, and role-based
									permissions.
								</p>
							</div>
						</div>
						<div className="glass-surface glass-specular p-6">
							<div className="relative z-10">
								<h3 className="text-[#6191D3] font-semibold text-sm mb-2">
									Custom Architecture Templates
								</h3>
								<p className="text-sm text-[#94A3B8]">
									Upload and validate your own architecture templates for domain-specific design
									reuse.
								</p>
							</div>
						</div>
						<div className="glass-surface glass-specular p-6">
							<div className="relative z-10">
								<h3 className="text-[#1565C0] font-semibold text-sm mb-2">
									Live 3D Preview
								</h3>
								<p className="text-sm text-[#94A3B8]">
									Interactive 3D board preview in the browser, powered by KiCad generated STEP files.
								</p>
							</div>
						</div>
						<div className="glass-surface glass-specular p-6">
							<div className="relative z-10">
								<h3 className="text-[#4CAF50] font-semibold text-sm mb-2">
									API Access
								</h3>
								<p className="text-sm text-[#94A3B8]">
									Programmatic access to the full workflow pipeline for CI/CD and automated design
									generation.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
