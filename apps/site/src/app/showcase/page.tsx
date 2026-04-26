import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Raino — Showcase',
	description:
		'See what engineers are building with Raino. Real projects, real schematics, real manufacturing handoffs.',
	openGraph: {
		title: 'Raino — Showcase',
		description:
			'Projects built with Raino. From sensor nodes to motor drivers, see what structured intelligence can ship.',
		images: ['/og-image.png'],
		url: 'https://raino-site.vercel.app/showcase',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Raino — Showcase',
		description:
			'Projects built with Raino. From sensor nodes to motor drivers, see what structured intelligence can ship.',
	},
};

const projects = [
	{
		title: 'Low-Power Sensor Node',
		category: 'Environmental Monitoring',
		description:
			'A battery-operated sensor board with temperature, humidity, and air quality sensing. Raino generated the full KiCad project from a plain-language description including power budget and communication constraints.',
		specs: [
			'STM32L072KZ microcontroller',
			'I2C sensor array',
			'40 x 30 mm',
			'6-month battery life',
		],
		deliverables: [
			'KiCad project',
			'Gerber exports',
			'BOM with alternates',
			'Rough quote: $18-24/unit',
		],
		color: '#1565C0',
	},
	{
		title: 'BLDC Motor Driver',
		category: 'Motor Control',
		description:
			'Three-phase brushless DC motor controller with current sensing and over-temperature protection. Raino selected an approved architecture template and matched driver ICs to the torque requirements.',
		specs: [
			'DRV8323RS gate driver',
			'Current sense: 0.01 ohm shunt',
			'50 x 40 mm',
			'24V / 10A peak',
		],
		deliverables: [
			'KiCad project',
			'ERC/DRC passed',
			'BOM with 3 alternates',
			'Rough quote: $32-45/unit',
		],
		color: '#6191D3',
	},
	{
		title: 'USB-C PD Hub',
		category: 'Power Delivery',
		description:
			'Multi-port USB-C power delivery hub with dynamic load balancing. Raino resolved ambiguities about port configurations and power profiles through the clarifying question loop.',
		specs: ['FUSB302B PD controller', '4 downstream ports', '80 x 50 mm', '100W total output'],
		deliverables: [
			'KiCad project',
			'Pick-and-place file',
			'BOM with sourcing data',
			'Rough quote: $28-38/unit',
		],
		color: '#1565C0',
	},
	{
		title: 'Precision Load Cell Interface',
		category: 'Signal Conditioning',
		description:
			'High-resolution load cell amplifier with 24-bit ADC and digital filtering. Raino ingested the ADC datasheet and validated the analog front-end against noise and drift specifications.',
		specs: ['HX711 24-bit ADC', 'Wheatstone bridge input', '35 x 25 mm', '0.1 mg resolution'],
		deliverables: [
			'KiCad project',
			'Gerber + drill',
			'BOM with lifecycle checks',
			'Rough quote: $12-16/unit',
		],
		color: '#4CAF50',
	},
	{
		title: 'LoRaWAN Gateway Module',
		category: 'Wireless Communication',
		description:
			'Sub-GHz LoRa transceiver module with onboard antenna matching and FCC pre-certified RF layout. Raino matched the RF architecture template to the frequency band and output power requirements.',
		specs: ['SX1262 transceiver', '868 / 915 MHz', '45 x 30 mm', '+22 dBm output'],
		deliverables: [
			'KiCad project',
			'Antenna matching report',
			'BOM with RF parts',
			'Rough quote: $22-30/unit',
		],
		color: '#FF9800',
	},
	{
		title: 'Capacitive Touch Controller',
		category: 'Human Interface',
		description:
			'Multi-channel capacitive touch sensing board with haptic feedback driver. Raino generated the touch electrode layout and validated trace lengths against the controller datasheet.',
		specs: ['CY8CMBR3116 controller', '12 touch channels', '50 x 35 mm', 'I2C + interrupt output'],
		deliverables: [
			'KiCad project',
			'ERC/DRC passed',
			'BOM with 2 alternates',
			'Rough quote: $15-20/unit',
		],
		color: '#EF5350',
	},
];

const testimonials = [
	{
		quote:
			'Raino cut our early-stage schematic time from two weeks to three days. The structured spec meant our senior engineer reviewed intent, not pinouts.',
		author: 'Engineering Lead',
		company: 'Industrial IoT Startup',
		color: '#1565C0',
	},
	{
		quote:
			'The BOM with real alternates saved us during the 2023 chip shortage. Raino had already flagged lifecycle risks before we even ordered.',
		author: 'Hardware Engineer',
		company: 'Robotics Company',
		color: '#6191D3',
	},
	{
		quote:
			'I described a motor driver in a paragraph and got a KiCad project with ERC passing. The clarifying questions caught a voltage level mismatch I would have missed.',
		author: 'Founder',
		company: 'Agricultural Sensor Platform',
		color: '#4CAF50',
	},
];

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
	const isEven = index % 2 === 0;

	return (
		<section className={`py-24 ${isEven ? 'bg-[#0A1929]' : 'bg-[#0D2137]'}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div
					className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
				>
					<div className={isEven ? '' : 'lg:order-2'}>
						<div
							className="inline-flex items-center gap-2 px-3 py-1 text-sm font-[family-name:var(--font-body)] mb-4 rounded-lg"
							style={{
								backgroundColor: `${project.color}10`,
								borderColor: `${project.color}30`,
								color: project.color,
								border: `1px solid ${project.color}30`,
							}}
						>
							{project.category}
						</div>
						<h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
							{project.title}
						</h2>
						<p className="text-[#94A3B8] mb-8">{project.description}</p>

						<div className="grid grid-cols-2 gap-4 mb-8">
							{project.specs.map((spec) => (
								<div key={spec} className="flex items-center gap-2 text-sm text-[#94A3B8]">
									<span style={{ color: project.color }}>›</span>
									<span>{spec}</span>
								</div>
							))}
						</div>

						<div className="glass-surface p-4">
							<h4 className="text-sm font-semibold text-[#64748B] mb-3">Raino Deliverables</h4>
							<ul className="space-y-2">
								{project.deliverables.map((d) => (
									<li key={d} className="flex items-center gap-2 text-sm text-[#94A3B8]">
										<span className="text-[#4CAF50]">&#10003;</span>
										<span>{d}</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className={`${isEven ? '' : 'lg:order-1'}`}>
						<div className="glass-elevated glass-specular aspect-video p-6 flex items-center justify-center relative overflow-hidden">
							<div className="relative z-10 w-full max-w-sm">
								<div
									className="w-full aspect-video border relative rounded-lg"
									style={{
										borderColor: `${project.color}40`,
										backgroundColor: `${project.color}05`,
									}}
								>
									<div className="absolute top-2 left-2 right-2 bottom-2">
										<div
											className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 rounded-lg"
											style={{ borderColor: `${project.color}60` }}
										/>
										<div
											className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 border-2 rounded"
											style={{ borderColor: `${project.color}40` }}
										/>
										<div
											className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 border-2 rounded"
											style={{ borderColor: `${project.color}40` }}
										/>
										<div
											className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-8 border-2 rounded"
											style={{ borderColor: `${project.color}40` }}
										/>
										<div
											className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-8 border-2 rounded"
											style={{ borderColor: `${project.color}40` }}
										/>
										<div
											className="absolute top-1/2 left-8 right-8 h-px"
											style={{ backgroundColor: `${project.color}30` }}
										/>
										<div
											className="absolute left-1/2 top-8 bottom-8 w-px"
											style={{ backgroundColor: `${project.color}30` }}
										/>
									</div>
									<div
										className="absolute bottom-2 right-2 text-xs font-[family-name:var(--font-body)]"
										style={{ color: `${project.color}80` }}
									>
										.kicad_pcb
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function ShowcasePage() {
	return (
		<main className="pt-16">
			<section className="py-24 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<h1 className="text-4xl sm:text-5xl font-bold text-[#E2E8F0] mb-6">
						Projects Built with <span className="text-[#1565C0]">Raino</span>
					</h1>
					<p className="text-xl text-[#94A3B8]">
						Real hardware projects generated from natural language descriptions. Each one passed
						ERC/DRC and shipped with a manufacturing-ready bundle.
					</p>
				</div>
			</section>

			{projects.map((project, index) => (
				<ProjectCard key={project.title} project={project} index={index} />
			))}

			<section className="py-24 bg-[#0A1929]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
							Loved by <span className="text-[#1565C0]">Engineers</span>
						</h2>
						<p className="text-[#94A3B8] max-w-2xl mx-auto">
							Teams using Raino report faster iteration, fewer schematic errors, and clearer
							communication between hardware and software engineers.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{testimonials.map((t) => (
							<div
								key={t.author}
								className="glass-surface glass-specular p-6"
							>
								<div className="relative z-10">
									<div className="mb-6">
										<svg
											className="w-8 h-8 opacity-30"
											fill="currentColor"
											viewBox="0 0 24 24"
											style={{ color: t.color }}
										>
											<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
										</svg>
									</div>
									<p className="text-[#94A3B8] mb-6 leading-relaxed">{t.quote}</p>
									<div>
										<p className="font-semibold text-[#E2E8F0] text-sm">
											{t.author}
										</p>
										<p className="text-sm" style={{ color: t.color }}>
											{t.company}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 bg-[#0D2137]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-6">
						Ready to Build <span className="text-[#1565C0]">Your Project?</span>
					</h2>
					<p className="text-[#94A3B8] mb-10">
						Describe your hardware idea in plain language and let Raino generate a structured spec,
						KiCad project, and manufacturing bundle.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<a
							href={process.env.NEXT_PUBLIC_APP_URL}
							className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
						>
							Launch Studio
						</a>
						<Link
							href="/workflow"
							className="glass-surface px-8 py-4 text-[#E2E8F0] font-semibold"
						>
							See the Workflow
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
