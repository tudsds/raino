import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Raino — 에이전트 기반 PCB 설계 플랫폼',
  description:
    'Raino는 모호한 하드웨어 의도를 구조화된 사양으로 변환하고, 검증된 아키텍처를 선택하며, 완전한 감사 추적이 포함된 KiCad 프로젝트를 생성합니다.',
  openGraph: {
    title: 'Raino — 에이전트 기반 PCB 설계 플랫폼',
    description:
      '모호한 하드웨어 아이디어를 제조 준비 완료 PCB 번들로 변환합니다. 구조화된 인텔리전스로 모든 과정을 주도',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/ko',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — 에이전트 기반 PCB 설계 플랫폼',
    description:
      '모호한 하드웨어 아이디어를 제조 준비 완료 PCB 번들로 변환합니다. 구조화된 인텔리전스로 모든 과정을 주도',
  },
};

const features = [
  {
    title: '자연어 입력',
    description:
      '일상 언어로 하드웨어를 설명하세요. Raino는 사용자의 의도를 이해하고, 명확화 질문을 통해 완전한 사양을 구축합니다.',
    icon: '💬',
  },
  {
    title: '구조화된 사양',
    description:
      '모호한 의도가 정밀한 사양으로 변환됩니다. 모든 요구사항이 캡처, 검증되며 전체 워크플로우에서 추적됩니다.',
    icon: '📋',
  },
  {
    title: '검증된 아키텍처',
    description:
      '제약된 아키텍처 선택으로 설계가 항상 검증된 템플릿 내에 유지됩니다. 무제한 자율 주행은 없습니다.',
    icon: '🏗️',
  },
  {
    title: '스마트 BOM',
    description:
      '조달 데이터, 대체품, 리스크 지표가 포함된 완전한 부품표(BOM). 모든 부품을 출처까지 추적할 수 있습니다.',
    icon: '📦',
  },
  {
    title: 'KiCad 생성',
    description:
      '자동화된 회로도 및 PCB 생성. Raino는 제안이 아닌 제조 준비 완료 KiCad 프로젝트를 출력합니다.',
    icon: '⚡',
  },
  {
    title: '제조 인계',
    description:
      '미리보기, 다운로드, 개략 견적, 선택적 PCBA 인계. 설계에서 양산까지 필요한 모든 것.',
    icon: '🚀',
  },
];

const workflowSteps = [
  { num: 1, title: '자연어 입력', desc: '일상 언어로 하드웨어 설명' },
  { num: 2, title: '명확화 질문', desc: 'Raino가 진행 전 모호성 해소' },
  { num: 3, title: '구조화된 사양', desc: '검증이 포함된 정식 요구사항' },
  { num: 4, title: '아키텍처 선택', desc: '요구사항에 매칭되는 검증된 템플릿' },
  { num: 5, title: '부품 패밀리 선정', desc: '조달 데이터가 포함된 후보 컴포넌트' },
  { num: 6, title: '문서 수집', desc: '데이터시트, 에라타, 애플리케이션 노트 분석' },
  { num: 7, title: '공급업체 메타데이터', desc: '공급업체의 실시간 가격, 재고, 최소주문수량' },
  { num: 8, title: 'RAG 추론', desc: '엔지니어링 지식으로 설계 결정 지원' },
  { num: 9, title: 'BOM 생성', desc: '대체품과 리스크 지표가 포함된 완전한 부품표' },
  { num: 10, title: 'KiCad 프로젝트', desc: '제조 준비 완료 회로도 및 PCB 파일' },
  { num: 11, title: '검증 및 내보내기', desc: 'ERC/DRC 검사 및 제조 파일 내보내기' },
  { num: 12, title: '견적 및 인계', desc: '신뢰구간이 포함된 개략 견적' },
];

const testimonials = [
  {
    quote:
      'Raino가 초기 회로도 설계 시간을 2주에서 3일로 단축했습니다. 구조화된 사양 덕분에 시니어 엔지니어가 핀아웃이 아닌 설계 의도를 검토할 수 있었습니다.',
    author: '엔지니어링 리드',
    company: '산업용 IoT 스타트업',
    color: '#1565C0',
  },
  {
    quote:
      '실제 대체품이 포함된 BOM은 2023년 반도체 부족 시기에 큰 도움이 되었습니다. Raino는 주문 전에 이미 라이프사이클 리스크를 표시해주었습니다.',
    author: '하드웨어 엔지니어',
    company: '로봇 기업',
    color: '#6191D3',
  },
  {
    quote:
      '모터 드라이버를 한 문단으로 설명했더니 ERC가 전부 통과하는 KiCad 프로젝트를 받았습니다. 명확화 질문에서 제가 놓칠 뻔한 전압 레벨 불일치를 잡아주었습니다.',
    author: '창업자',
    company: '농업 센서 플랫폼',
    color: '#4CAF50',
  },
];

const integrationLogos = [
  { name: 'Kimi', category: 'LLM', color: '#1565C0' },
  { name: 'Supabase', category: '데이터베이스', color: '#4CAF50' },
  { name: 'DigiKey', category: '공급업체', color: '#FF9800' },
  { name: 'Mouser', category: '공급업체', color: '#FF9800' },
  { name: 'JLCPCB', category: '제조', color: '#1565C0' },
  { name: 'KiCad', category: 'EDA', color: '#6191D3' },
];

function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Link href="/" className="px-2 py-1 text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        EN
      </Link>
      <span className="text-[#64748B]">|</span>
      <Link href="/zh" className="px-2 py-1 text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        中文
      </Link>
      <span className="text-[#64748B]">|</span>
      <Link href="/ja" className="px-2 py-1 text-[#64748B] hover:text-[#E2E8F0] transition-colors">
        日本語
      </Link>
      <span className="text-[#64748B]">|</span>
      <span className="px-2 py-1 text-[#E2E8F0] font-semibold">한국어</span>
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
          <span className="text-sm text-[#94A3B8]">MIT 라이선스 · 오픈소스</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E2E8F0] leading-tight mb-6">
          <span className="text-[#1565C0]">구조화된 인텔리전스</span>로 PCB 설계하기
        </h1>
        <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10">
          Raino는 모호한 하드웨어 의도를 구조화된 사양으로 변환하고, 검증된 아키텍처를 선택하며, 완전한 감사 추적이 포함된 KiCad 프로젝트를 생성합니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
          >
            시작하기
          </a>
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] font-semibold rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
          >
            GitHub에서 보기
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
            하드웨어 출시에 필요한 <span className="text-[#1565C0]">모든 것</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            자연어에서 제조 인계까지. Raino는 제약된 에이전트와 형식적 검증으로 전체 워크플로우를 처리합니다.
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
            <span className="text-[#1565C0]">엔지니어</span>들의 선택
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Raino를 사용하는 팀들은 더 빠른 반복, 적은 회로도 오류, 하드웨어와 소프트웨어 엔지니어 간의 명확한 소통을 보고하고 있습니다.
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
            <span className="text-[#1565C0]">최고 수준의 도구</span>로 구동
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Raino는 업계 표준 공급업체, 데이터베이스, 설계 도구와 통합됩니다. 모든 연결에 정직한 폴백 모드가 있습니다.
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
            모든 통합 보기
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
              시스템 <span className="text-[#1565C0]">아키텍처</span>
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Raino는 명확한 경계를 가진 모듈식 시스템으로 구축되었습니다. 마케팅 사이트와 프로덕트 스튜디오는 잘 정의된 API를 통해 워커 서비스와 통신합니다.
            </p>
            <ul className="space-y-3">
              {[
                '마케팅 사이트 — 공개 정보 및 문서',
                '프로덕트 스튜디오 — 설계 워크플로우 애플리케이션',
                '코어 패키지 — Schema, 검증, 도메인 로직, RAG, LLM 게이트웨이',
                '워커 서비스 — 수집, 설계, 견적, 감사',
                '외부 경계 — Supabase, KiCad CLI, 공급업체 API',
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
              전체 아키텍처 보기
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
            <span className="text-[#1565C0]">작동 원리</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            자연어에서 제조 인계까지 12단계 워크플로우. 각 단계에 형식적 검증과 감사 추적이 있습니다.
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
          오픈<span className="text-[#1565C0]">소스</span>
        </h2>
        <p className="text-[#94A3B8] mb-8">
          Raino는 MIT 라이선스입니다. 전체 코드베이스가 GitHub에서 공개되어 있습니다. 기여, 포크, 또는 자체 인스턴스 배포가 가능합니다.
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
            GitHub에서 보기
          </a>
          <span className="px-4 py-2 bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] text-sm font-mono rounded-lg">
            MIT 라이선스
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
