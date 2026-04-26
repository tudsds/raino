import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Raino — Trust & Security',
	description:
		'Raino is MIT licensed, open source, and built with transparency. Learn about our security model, privacy policy, and no-fake-integration commitment.',
	openGraph: {
		title: 'Raino — Trust & Security',
		description:
			'MIT licensed, open source, and transparent. No fake integrations, no silent fallbacks, no tracking.',
		images: ['/og-image.png'],
		url: 'https://raino-site.vercel.app/trust',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Raino — Trust & Security',
		description:
			'MIT licensed, open source, and transparent. No fake integrations, no silent fallbacks, no tracking.',
	},
};

const securityPractices = [
	{
		title: 'MIT Licensed',
		description:
			'The entire Raino codebase is MIT licensed. You can inspect, fork, modify, and deploy your own instance without restrictions.',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="w-6 h-6"
			>
				<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
			</svg>
		),
		color: '#1565C0',
	},
	{
		title: 'Open Source',
		description:
			'Every line of code is on GitHub. There are no black boxes, no proprietary algorithms, and no hidden data processing.',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="w-6 h-6"
			>
				<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
			</svg>
		),
		color: '#4CAF50',
	},
	{
		title: 'No Tracking',
		description:
			'Raino does not use analytics cookies, tracking pixels, or third-party telemetry. Your design data stays on your infrastructure.',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="w-6 h-6"
			>
				<path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
			</svg>
		),
		color: '#1565C0',
	},
	{
		title: 'Row-Level Security',
		description:
			'Supabase RLS policies ensure users can only access their own data. Every database query is filtered by authenticated identity.',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="w-6 h-6"
			>
				<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
		),
		color: '#6191D3',
	},
	{
		title: 'No Secrets in Code',
		description:
			'API keys and credentials are never committed to the repository. Environment variables are validated at startup with clear error messages.',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="w-6 h-6"
			>
				<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
		),
		color: '#FF9800',
	},
	{
		title: 'Audit Trail',
		description:
			'Every design decision, part selection, and workflow step is logged. You can trace any output back to its inputs and rationale.',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="w-6 h-6"
			>
				<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
			</svg>
		),
		color: '#EF5350',
	},
];

const commitments = [
	{
		title: 'No Fake Integrations',
		description:
			'Raino never fabricates live pricing, stock data, or API responses. When using fixture data, every value is clearly labeled as an estimate. You never have to guess whether the data you see is live or synthetic.',
		color: '#1565C0',
	},
	{
		title: 'No Silent Fallbacks',
		description:
			'When the system falls back to degraded mode, you are told explicitly. There are no silent downgrades, no hidden mock switches, and no pretense that fixture data comes from a live API.',
		color: '#4CAF50',
	},
	{
		title: 'No Ghost Parts',
		description:
			'Every part number in a BOM traces back to a supplier datasheet, a catalog page, or a clearly labeled fixture estimate. There are no hallucinated components with made-up specifications.',
		color: '#6191D3',
	},
	{
		title: 'Human in the Loop',
		description:
			'Critical ambiguity stops the workflow. The system asks you before proceeding. You are the final authority on your own design, not the LLM.',
		color: '#1565C0',
	},
];

export default function TrustPage() {
	return (
		<main className="pt-16">
			<section className="py-24 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<h1 className="text-4xl sm:text-5xl font-bold text-[#E2E8F0] mb-6">
						Trust & <span className="text-[#1565C0]">Security</span>
					</h1>
					<p className="text-xl text-[#94A3B8]">
						Raino is built on transparency. Open source, honest fallbacks, and no surprises.
					</p>
				</div>
			</section>

			<section className="py-24 bg-[#0D2137]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
							Security <span className="text-[#1565C0]">Practices</span>
						</h2>
						<p className="text-[#94A3B8] max-w-2xl mx-auto">
							Raino follows security best practices at every layer. From code to deployment, your
							data and designs are protected.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{securityPractices.map((practice) => (
							<div
								key={practice.title}
								className="glass-elevated glass-specular p-6"
							>
								<div className="relative z-10">
									<div className="mb-4" style={{ color: practice.color }}>
										{practice.icon}
									</div>
									<h3
										className="text-lg font-semibold mb-3"
										style={{ color: practice.color }}
									>
										{practice.title}
									</h3>
									<p className="text-sm text-[#94A3B8]">{practice.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 bg-[#0A1929]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
							Our <span className="text-[#1565C0]">Commitments</span>
						</h2>
						<p className="text-[#94A3B8] max-w-2xl mx-auto">
							These are not marketing claims. They are architectural constraints built into the
							system.
						</p>
					</div>
					<div className="space-y-6">
						{commitments.map((commitment, index) => (
							<div
								key={commitment.title}
								className="glass-surface glass-specular p-8"
							>
								<div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-6">
									<div className="lg:w-1/4">
										<div className="flex items-center gap-3">
											<span
												className="flex items-center justify-center w-10 h-10 border font-[family-name:var(--font-body)] font-bold text-lg rounded-lg"
												style={{ borderColor: `${commitment.color}60`, color: commitment.color }}
											>
												{String(index + 1).padStart(2, '0')}
											</span>
											<h3
												className="text-xl font-semibold"
												style={{ color: commitment.color }}
											>
												{commitment.title}
											</h3>
										</div>
									</div>
									<div className="lg:w-3/4">
										<p className="text-[#94A3B8] leading-relaxed">{commitment.description}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 bg-[#0D2137]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="glass-blue-tint glass-specular p-8 text-center">
						<div className="relative z-10">
							<h2 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] mb-6">
								Privacy <span className="text-[#1565C0]">Policy</span>
							</h2>
							<div className="text-left space-y-6">
								<div>
									<h3 className="text-[#1565C0] font-semibold text-sm mb-2">
										Data Collection
									</h3>
									<p className="text-sm text-[#94A3B8]">
										Raino collects only the data necessary to run the hardware design workflow: your
										natural language descriptions, structured specifications, and generated design
										artifacts. We do not collect browsing history, device fingerprints, or behavioral
										analytics.
									</p>
								</div>
								<div>
									<h3 className="text-[#6191D3] font-semibold text-sm mb-2">
										Data Storage
									</h3>
									<p className="text-sm text-[#94A3B8]">
										When you self-host Raino, all data stays on your Supabase instance. When using a
										hosted instance, data is stored in your dedicated project with RLS policies
										preventing cross-tenant access. We do not share data with third parties.
									</p>
								</div>
								<div>
									<h3 className="text-[#4CAF50] font-semibold text-sm mb-2">
										LLM Data Handling
									</h3>
									<p className="text-sm text-[#94A3B8]">
										Natural language descriptions are sent to the Kimi K2.5 API for parsing and
										reasoning. Raino does not send LLM providers any personally identifiable
										information beyond what you type into the intake form. Structured output is
										validated before storage.
									</p>
								</div>
								<div>
									<h3 className="text-[#1565C0] font-semibold text-sm mb-2">
										Your Rights
									</h3>
									<p className="text-sm text-[#94A3B8]">
										You can export, modify, or delete your data at any time through the studio
										interface. Because Raino is open source, you can also run a complete data purge
										directly against your database.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-24 bg-[#0A1929]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-2xl sm:text-3xl font-bold text-[#E2E8F0] mb-6">
						Open <span className="text-[#1565C0]">Source</span>
					</h2>
					<p className="text-[#94A3B8] mb-8">
						Trust is verified, not claimed. The entire Raino codebase is available on GitHub for
						inspection, audit, and contribution.
					</p>
					<a
						href="https://github.com/tudsds/raino"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 glass-surface px-8 py-4 text-[#E2E8F0] font-semibold"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						Inspect the Code on GitHub
					</a>
				</div>
			</section>
		</main>
	);
}
