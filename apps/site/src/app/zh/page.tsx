import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Raino — 智能代理 PCB 设计平台',
  description:
    'Raino 将模糊的硬件意图转化为结构化规格，选择经过验证的架构，并生成带有完整审计追踪的 KiCad 项目。',
  openGraph: {
    title: 'Raino — 智能代理 PCB 设计平台',
    description:
      '将模糊的硬件想法转化为生产就绪的 PCB 打包方案，让结构化智能驱动每个决策',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/zh',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — 智能代理 PCB 设计平台',
    description:
      '将模糊的硬件想法转化为生产就绪的 PCB 打包方案，让结构化智能驱动每个决策',
  },
};

const features = [
  {
    title: '自然语言输入',
    description:
      '用日常语言描述硬件需求。Raino 理解你的意图，通过追问来构建完整的规格说明。',
    icon: '💬',
  },
  {
    title: '结构化规格',
    description:
      '模糊意图变为精确规格。每一项需求都被捕获、验证，并在整个工作流中全程追踪。',
    icon: '📋',
  },
  {
    title: '已验证架构',
    description:
      '受限的架构选择确保设计始终在已验证的模板范围内。不会出现不受约束的自动决策。',
    icon: '🏗️',
  },
  {
    title: '智能 BOM',
    description:
      '完整的物料清单，包含采购数据、替代料和风险指标。每个元器件都可追溯至其来源。',
    icon: '📦',
  },
  {
    title: 'KiCad 生成',
    description:
      '自动化的原理图和 PCB 生成。Raino 产出生产就绪的 KiCad 项目，而非建议方案。',
    icon: '⚡',
  },
  {
    title: '制造交付',
    description:
      '预览、下载、初步报价，以及可选的 PCBA 交付。从设计到量产所需的一切。',
    icon: '🚀',
  },
];

const workflowSteps = [
  { num: 1, title: '自然语言输入', desc: '用日常语言描述你的硬件需求' },
  { num: 2, title: '追问澄清', desc: 'Raino 在推进前解决所有歧义' },
  { num: 3, title: '结构化规格', desc: '带有验证的正式需求文档' },
  { num: 4, title: '架构选择', desc: '匹配你需求的已验证模板' },
  { num: 5, title: '元器件族筛选', desc: '带有采购数据的候选元器件' },
  { num: 6, title: '文档摄取', desc: '数据手册、勘误和应用笔记的分析' },
  { num: 7, title: '供应商元数据', desc: '来自供应商的真实价格、库存和起订量' },
  { num: 8, title: 'RAG 推理', desc: '工程知识辅助设计决策' },
  { num: 9, title: 'BOM 生成', desc: '包含替代料和风险指标的完整物料清单' },
  { num: 10, title: 'KiCad 项目', desc: '生产就绪的原理图和 PCB 文件' },
  { num: 11, title: '验证与导出', desc: 'ERC/DRC 检查和制造文件导出' },
  { num: 12, title: '报价与交付', desc: '附带置信区间的初步报价' },
];

const testimonials = [
  {
    quote:
      'Raino 将我们早期原理图设计的时间从两周缩短到三天。结构化规格让资深工程师专注于审核设计意图，而不是逐个检查引脚连接。',
    author: '工程负责人',
    company: '工业物联网初创公司',
    color: '#1565C0',
  },
  {
    quote:
      '带有真实替代料的 BOM 在 2023 年芯片短缺期间救了我们。Raino 在我们下单之前就已经标记了生命周期风险。',
    author: '硬件工程师',
    company: '机器人公司',
    color: '#6191D3',
  },
  {
    quote:
      '我用一段话描述了电机驱动需求，就得到了 ERC 全部通过的 KiCad 项目。追问环节捕捉到了一个我差点遗漏的电压电平不匹配问题。',
    author: '创始人',
    company: '农业传感器平台',
    color: '#4CAF50',
  },
];

const integrationLogos = [
  { name: 'Kimi', category: 'LLM', color: '#1565C0' },
  { name: 'Supabase', category: '数据库', color: '#4CAF50' },
  { name: 'DigiKey', category: '供应商', color: '#FF9800' },
  { name: 'Mouser', category: '供应商', color: '#FF9800' },
  { name: 'JLCPCB', category: '制造', color: '#1565C0' },
  { name: 'KiCad', category: 'EDA', color: '#6191D3' },
];

function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/" className="px-2 py-1 text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        EN
      </Link>
      <span className="text-[#64748B]">|</span>
      <span className="px-2 py-1 text-[#E2E8F0] font-semibold">中文</span>
      <span className="text-[#64748B]">|</span>
      <Link href="/ja" className="px-2 py-1 text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        日本語
      </Link>
      <span className="text-[#64748B]">|</span>
      <Link href="/ko" className="px-2 py-1 text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        한국어
      </Link>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 bg-gradient-to-b from-[#0A1929] via-[#0D2137] to-[#0A1929]">
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl mb-8">
          <span className="w-2 h-2 bg-[#4CAF50] rounded-full animate-subtle-pulse" />
          <span className="text-sm text-[#94A3B8]">MIT 开源许可</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E2E8F0] leading-tight mb-6">
          用<span className="text-[#1565C0]">结构化智能</span>设计 PCB
        </h1>
        <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10">
          Raino 将模糊的硬件意图转化为结构化规格，选择经过验证的架构，并生成带有完整审计追踪的 KiCad 项目。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
          >
            立即开始
          </a>
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] font-semibold rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
          >
            在 GitHub 上查看
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-24 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
            完成硬件交付的<span className="text-[#1565C0]">一切所需</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            从自然语言到制造交付。Raino 通过受限代理和形式化验证处理整个工作流。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.24)] transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-[#E2E8F0]">
                {feature.title}
              </h3>
              <p className="text-[#94A3B8]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LovedByEngineers() {
  return (
    <section className="py-24 bg-[#0D2137]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
            深受<span className="text-[#1565C0]">工程师</span>信赖
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            使用 Raino 的团队报告称，迭代速度更快、原理图错误更少、硬件与软件工程师之间的沟通更加清晰。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="p-6 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationLogos() {
  return (
    <section className="py-24 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
            由<span className="text-[#1565C0]">行业领先工具</span>驱动
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Raino 集成行业标准的供应商、数据库和设计工具。每个连接都有诚实的降级模式。
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrationLogos.map((logo) => (
            <Link
              key={logo.name}
              href="/integrations"
              className="group p-6 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300 text-center flex flex-col items-center justify-center gap-3"
            >
              <span
                className="text-2xl font-bold"
                style={{ color: logo.color }}
              >
                {logo.name}
              </span>
              <span className="text-xs text-[#64748B] uppercase tracking-wider">
                {logo.category}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 text-[#1565C0] hover:text-[#6191D3] transition-colors"
          >
            查看所有集成
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="py-24 bg-[#0D2137]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-6">
              系统<span className="text-[#1565C0]">架构</span>
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Raino 采用模块化系统构建，具有清晰的边界。营销站点和产品工作室通过定义完善的 API 与工作服务通信。
            </p>
            <ul className="space-y-3">
              {[
                '营销站点 — 面向公众的信息和文档',
                '产品工作室 — 设计工作流应用',
                '核心包 — Schema、验证、领域逻辑、RAG、LLM 网关',
                '工作服务 — 摄取、设计、报价、审计',
                '外部边界 — Supabase、KiCad CLI、供应商 API',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#94A3B8]">
                  <span className="text-[#1565C0] mt-1">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 mt-8 text-[#1565C0] hover:text-[#6191D3] transition-colors"
            >
              查看完整架构
              <span>→</span>
            </Link>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-[#94A3B8]">
              {`┌─────────────────────────────────────────────┐
│                  Users                       │
│                                              │
│  ┌──────────┐          ┌────────────────┐    │
│  │  site    │───CTA───▶│    studio      │    │
│  │ (marketing)│        │  (product app) │    │
│  └──────────┘          └───────┬────────┘    │
│                                │             │
│  ┌─────────────────────────────┴──────────┐  │
│  │         packages/core (schemas, logic) │  │
│  ├────────┬────────┬────────┬────────────┤  │
│  │  rag   │  llm   │   db   │  agents    │  │
│  │  ui    │kicad-w-c│supplier-c│        │  │
│  └────────┴────────┴────────┴────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ingest · design · quote · audit       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌──────────┬──────────┬──────────────────┐  │
│  │ Supabase │  KiCad   │ DigiKey/Mouser   │  │
│  │(Auth+DB) │ (GPL CLI)│    /JLCPCB       │  │
│  └──────────┴──────────┴──────────────────┘  │
└─────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0A1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-4">
            工作<span className="text-[#1565C0]">流程</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            从自然语言到制造交付的 12 步工作流。每一步都有形式化验证和审计追踪。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div key={step.num} className="relative">
              <div className="p-6 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#1565C0]/10 border border-[#1565C0]/30 text-[#1565C0] font-mono font-bold text-sm rounded-lg">
                    {step.num}
                  </span>
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-[#1565C0]/30 to-transparent" />
                  )}
                </div>
                <h3 className="font-semibold text-[#E2E8F0] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#64748B]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className="py-24 bg-[#0D2137]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#E2E8F0] mb-6">
          开源<span className="text-[#1565C0]">项目</span>
        </h2>
        <p className="text-[#94A3B8] mb-8">
          Raino 采用 MIT 许可证。完整代码库在 GitHub 上公开。欢迎贡献、Fork 或部署你自己的实例。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            在 GitHub 上查看
          </a>
          <span className="px-4 py-2 bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] text-sm font-mono rounded-lg">
            MIT 许可证
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <LovedByEngineers />
      <Architecture />
      <IntegrationLogos />
      <HowItWorks />
      <OpenSource />
    </main>
  );
}
