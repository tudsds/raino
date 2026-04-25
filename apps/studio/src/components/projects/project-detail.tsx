'use client';
import Link from 'next/link';
import WorkflowProgress from '@/components/WorkflowProgress';
import StatusBadge, { type Status } from '@/components/StatusBadge';

interface Project {
 id: string;
 name: string;
 description?: string;
 status: Status;
 currentStep: number;
 totalSteps: number;
 createdAt: string;
 updatedAt: string;
 organization?: {
 id: string;
 name: string;
 };
}

interface ProjectDetailProps {
 project: Project;
}

const workflowSteps = [
 { key: 'intake', label: 'Intake', description: 'Describe your project requirements', href: (id: string) => `/projects/${id}/intake` },
 { key: 'spec', label: 'Specification', description: 'AI-generated technical specification', href: (id: string) => `/projects/${id}/spec` },
 { key: 'architecture', label: 'Architecture', description: 'System architecture planning', href: (id: string) => `/projects/${id}/architecture` },
 { key: 'bom', label: 'Bill of Materials', description: 'Component sourcing and pricing', href: (id: string) => `/projects/${id}/bom` },
 { key: 'design', label: 'Design Generation', description: 'KiCad schematic and PCB layout', href: (id: string) => `/projects/${id}/design` },
 { key: 'validate', label: 'Validation', description: 'ERC/DRC checks and verification', href: (id: string) => `/projects/${id}/validate` },
 { key: 'previews', label: 'Previews', description: 'Schematic, PCB 2D and 3D previews', href: (id: string) => `/projects/${id}/previews` },
 { key: 'downloads', label: 'Downloads', description: 'Gerber files and design exports', href: (id: string) => `/projects/${id}/downloads` },
 { key: 'quote', label: 'Quote', description: 'Manufacturing cost estimation', href: (id: string) => `/projects/${id}/quote` },
];

export function ProjectDetail({ project }: ProjectDetailProps) {
 const progress = project.totalSteps > 0
 ? Math.round((project.currentStep / project.totalSteps) * 100)
 : 0;

 return (
 <div className="min-h-screen bg-[#0A1929]">
 <div className="max-w-7xl mx-auto px-6 py-8">
 {/* Project Header */}
 <div className="mb-8">
 <div className="flex items-start justify-between mb-4">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <Link
 href="/"
 className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors duration-300 text-sm"
 >
 ← Dashboard
 </Link>
 </div>
 <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2">{project.name}</h1>
 {project.description && (
 <p className="text-[#94A3B8] text-base max-w-2xl">{project.description}</p>
 )}
 </div>
 <div className="flex items-center gap-3">
 <StatusBadge status={project.status} />
 </div>
 </div>

 {/* Progress */}
 <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)] rounded-xl p-4">
 <WorkflowProgress progress={progress} showSteps={true} />
 </div>
 </div>

 {/* Workflow Steps */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
 {workflowSteps.map((step, index) => {
 const stepNumber = index + 1;
 const isCompleted = project.currentStep >= stepNumber;
 const isCurrent = project.currentStep === index;
 const isAccessible = project.currentStep >= index;

 return (
 <div
 key={step.key}
 className={`border p-4 rounded-xl transition-all duration-300 ${
 isCompleted
 ? 'border-[#1565C0]/40 bg-[#1565C0]/5'
 : isCurrent
 ? 'border-[#6191D3]/60 bg-[#6191D3]/5'
 : 'border-white/[0.12] bg-white/[0.04]'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <span className={`text-xs font-[family-name:var(--font-body)] ${
 isCompleted ? 'text-[#1565C0]' : isCurrent ? 'text-[#6191D3]' : 'text-[#64748B]'
 }`}>
 STEP {stepNumber}
 </span>
 {isCompleted && (
 <span className="text-[#1565C0] text-xs">✓ Done</span>
 )}
 {isCurrent && (
 <span className="text-[#6191D3] text-xs animate-pulse">● Active</span>
 )}
 </div>
 <h3 className="text-[#E2E8F0] font-semibold mb-1">{step.label}</h3>
 <p className="text-[#64748B] text-xs mb-3">{step.description}</p>
 {isAccessible ? (
 <Link
 href={step.href(project.id)}
 className={`inline-block text-xs px-3 py-1.5 border transition-all duration-300 rounded-lg ${
 isCompleted
 ? 'border-[#1565C0]/40 text-[#1565C0] hover:bg-[#1565C0]/10'
 : isCurrent
 ? 'border-[#6191D3] text-[#6191D3] hover:bg-[#6191D3]/10'
 : 'border-white/[0.12] text-[#94A3B8] hover:border-[#1565C0] hover:text-[#1565C0]'
 }`}
 >
 {isCompleted ? 'Review' : isCurrent ? 'Continue →' : 'Open'}
 </Link>
 ) : (
 <span className="text-xs text-[#64748B] opacity-50">Locked</span>
 )}
 </div>
 );
 })}
 </div>

 {/* Quick Actions */}
 <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)] rounded-xl p-6">
 <h2 className="text-[#E2E8F0] font-semibold mb-4">Quick Actions</h2>
 <div className="flex flex-wrap gap-3">
 <Link
 href={`/projects/${project.id}/intake`}
 className="border border-[#1565C0] text-[#1565C0] px-4 py-2 text-sm hover:bg-[#1565C0] hover:text-white transition-all duration-300 rounded-lg"
 >
 Start Intake Chat
 </Link>
 <Link
 href={`/projects/${project.id}/downloads`}
 className="border border-white/[0.12] text-[#94A3B8] px-4 py-2 text-sm hover:border-[#1565C0] hover:text-[#1565C0] transition-all duration-300 rounded-lg"
 >
 Download Files
 </Link>
 <Link
 href={`/projects/${project.id}/quote`}
 className="border border-white/[0.12] text-[#94A3B8] px-4 py-2 text-sm hover:border-[#1565C0] hover:text-[#1565C0] transition-all duration-300 rounded-lg"
 >
 Get Quote
 </Link>
 </div>
 </div>

 {/* Project Meta */}
 <div className="mt-4 flex items-center gap-6 text-xs text-[#64748B]">
 <span>ID: <code className="text-[#94A3B8]">{project.id}</code></span>
 {project.organization && (
 <span>Org: <span className="text-[#94A3B8]">{project.organization.name}</span></span>
 )}
 <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
 <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
 </div>
 </div>
 </div>
 );
}
