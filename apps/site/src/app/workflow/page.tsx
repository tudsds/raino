import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Raino — Workflow',
	description:
		'A 12-step workflow from natural language to manufacturing handoff. Every step has formal validation and audit trails.',
	openGraph: {
		title: 'Raino — Workflow',
		description:
			'From natural language to manufacturing handoff. Twelve structured steps with formal validation and full audit trails.',
		images: ['/og-image.png'],
		url: 'https://raino-site.vercel.app/workflow',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Raino — Workflow',
		description:
			'From natural language to manufacturing handoff. Twelve structured steps with formal validation and full audit trails.',
	},
};

const workflowSteps = [
	{
		num: 1,
		title: 'Natural Language Intake',
		description:
			'Describe your hardware in plain language. Raino parses intent, constraints, and requirements from your input.',
		icon: '💬',
		color: '#1565C0',
	},
	{
		num: 2,
		title: 'Clarifying Questions',
		description:
			'Raino resolves ambiguities through a multi-turn question loop before proceeding to formal specs.',
		icon: '❓',
		color: '#6191D3',
	},
	{
		num: 3,
		title: 'Structured Specification',
		description:
			'Fuzzy intent becomes a formal, validated specification with traceability to every requirement.',
		icon: '📋',
		color: '#1565C0',
	},
	{
		num: 4,
		title: 'Architecture Selection',
		description:
			'Your requirements are matched against a library of pre-validated architecture templates.',
		icon: '🏗️',
		color: '#4CAF50',
	},
	{
		num: 5,
		title: 'Part Family Selection',
		description:
			'Candidate components are selected with sourcing data, alternates, and risk indicators.',
		icon: '🔧',
		color: '#FF9800',
	},
	{
		num: 6,
		title: 'Document Ingestion',
		description:
			'Datasheets, errata, and application notes are fetched, parsed, chunked, and embedded.',
		icon: '📄',
		color: '#1565C0',
	},
	{
		num: 7,
		title: 'Supplier Metadata Resolution',
		description:
			'Real supplier adapters query DigiKey, Mouser, and JLCPCB for prices, stock, and MOQs.',
		icon: '🏭',
		color: '#6191D3',
	},
	{
		num: 8,
		title: 'RAG-Assisted Reasoning',
		description:
			'Engineering knowledge is retrieved from documents to inform component and design decisions.',
		icon: '🧠',
		color: '#1565C0',
	},
	{
		num: 9,
		title: 'BOM Generation',
		description:
			'A full KiCad-ready bill of materials is generated with alternates and confidence scoring.',
		icon: '📦',
		color: '#4CAF50',
	},
	{
		num: 10,
		title: 'KiCad Project Generation',
		description:
			'Production-ready schematic and PCB files are generated from the approved architecture.',
		icon: '⚡',
		color: '#FF9800',
	},
	{
		num: 11,
		title: 'Preview & Download',
		description:
			'Interactive previews, manufacturing bundles, and downloadable artifacts are produced.',
		icon: '👁️',
		color: '#1565C0',
	},
	{
		num: 12,
		title: 'Quote & Handoff',
		description:
			'Receive a rough quote with confidence bands and optionally request a PCBA handoff.',
		icon: '🚀',
		color: '#6191D3',
	},
];

function StepNode({
	step,
	isLast,
	align,
}: {
	step: (typeof workflowSteps)[0];
	isLast: boolean;
	align: 'left' | 'right';
}) {
	return (
		<div className="relative flex items-center justify-center">
			<div className={`hidden lg:block w-5/12 ${align === 'right' ? 'order-1' : 'order-3'}`}>
				<div
					className={`glass-surface glass-specular p-6 ${align === 'right' ? 'ml-auto' : 'mr-auto'}`}
					style={{ maxWidth: '20rem' }}
				>
					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-2xl">{step.icon}</span>
							<span
								className="flex items-center justify-center w-7 h-7 border font-[family-name:var(--font-body)] font-bold text-sm rounded-lg"
								style={{ borderColor: `${step.color}60`, color: step.color }}
							>
								{step.num}
							</span>
						</div>
						<h3
							className="text-lg font-semibold mb-2"
							style={{ color: step.color }}
						>
							{step.title}
						</h3>
						<p className="text-sm text-[#94A3B8]">{step.description}</p>
					</div>
				</div>
			</div>

			<div className="hidden lg:flex order-2 w-2/12 flex-col items-center">
				<div className="w-4 h-4 rounded-full" style={{ backgroundColor: step.color }} />
				{!isLast && (
					<div
						className="w-px flex-1 min-h-[3rem]"
						style={{
							background: `linear-gradient(to bottom, ${step.color}, ${workflowSteps[step.num]?.color ?? 'rgba(255,255,255,0.12)'})`,
						}}
					/>
				)}
			</div>

			<div className={`hidden lg:block w-5/12 ${align === 'right' ? 'order-3' : 'order-1'}`} />

			<div className="lg:hidden w-full">
				<div className="flex gap-4">
					<div className="flex flex-col items-center">
						<div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: step.color }} />
						{!isLast && (
							<div
								className="w-px flex-1 min-h-[2rem] mt-2"
								style={{
									background: `linear-gradient(to bottom, ${step.color}, ${workflowSteps[step.num]?.color ?? 'rgba(255,255,255,0.12)'})`,
								}}
							/>
						)}
					</div>
					<div className="flex-1 glass-surface glass-specular p-5 mb-6">
						<div className="relative z-10">
							<div className="flex items-center gap-3 mb-3">
								<span className="text-2xl">{step.icon}</span>
								<span
									className="flex items-center justify-center w-7 h-7 border font-[family-name:var(--font-body)] font-bold text-sm rounded-lg"
									style={{ borderColor: `${step.color}60`, color: step.color }}
								>
									{step.num}
								</span>
							</div>
							<h3
								className="text-lg font-semibold mb-2"
								style={{ color: step.color }}
							>
								{step.title}
							</h3>
							<p className="text-sm text-[#94A3B8]">{step.description}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function WorkflowPage() {
	return (
		<>
			<main className="pt-16">
				<section className="py-24 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
					<div className="max-w-4xl mx-auto px-4 text-center">
						<h1 className="text-4xl sm:text-5xl font-bold text-[#E2E8F0] mb-6">
							The <span className="text-[#1565C0]">Workflow</span>
						</h1>
						<p className="text-xl text-[#94A3B8]">
							From natural language to manufacturing handoff. Twelve structured steps with formal
							validation and full audit trails.
						</p>
					</div>
				</section>

				<section className="py-24 bg-[#0D2137]">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="space-y-0 lg:space-y-4">
							{workflowSteps.map((step, index) => (
								<StepNode
									key={step.num}
									step={step}
									isLast={index === workflowSteps.length - 1}
									align={index % 2 === 0 ? 'left' : 'right'}
								/>
							))}
						</div>
					</div>
				</section>

				<section className="py-24 bg-[#0A1929]">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-6">
							Ready to <span className="text-[#1565C0]">Try It?</span>
						</h2>
						<p className="text-[#94A3B8] mb-10">
							Launch the Raino studio and run through the workflow with your own hardware idea.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<a
								href={process.env.NEXT_PUBLIC_APP_URL}
								className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
							>
								Try the Workflow
							</a>
							<Link
								href="/docs"
								className="glass-surface px-8 py-4 text-[#E2E8F0] font-semibold"
							>
								Read the Docs
							</Link>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
