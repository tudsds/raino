import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Raino — エージェント型 PCB 設計プラットフォーム',
  description:
    'Raino は曖昧なハードウェア要件を構造化仕様に変換し、検証済みアーキテクチャを選択して、完全な監査証跡付き KiCad プロジェクトを生成します。',
  openGraph: {
    title: 'Raino — エージェント型 PCB 設計プラットフォーム',
    description:
      '曖昧なハードウェアのアイデアを製造準備完了の PCB バンドルに変換。構造化インテリジェンスですべてを駆動',
    images: ['/og-image.png'],
    url: 'https://raino-site.vercel.app/ja',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raino — エージェント型 PCB 設計プラットフォーム',
    description:
      '曖昧なハードウェアのアイデアを製造準備完了の PCB バンドルに変換。構造化インテリジェンスですべてを駆動',
  },
};

const features = [
  {
    title: '自然言語入力',
    description:
      '日常言語でハードウェアを記述。Raino は意図を理解し、明確化のための質問を通じて完全な仕様を構築します。',
    icon: '💬',
  },
  {
    title: '構造化仕様',
    description:
      '曖昧な意図が精密な仕様に変換されます。すべての要件がキャプチャ、検証され、ワークフロー全体でトレースされます。',
    icon: '📋',
  },
  {
    title: '検証済みアーキテクチャ',
    description:
      '制約付きアーキテクチャ選択により、設計は常に検証済みテンプレート内に留まります。無制限な自動運転はありません。',
    icon: '🏗️',
  },
  {
    title: 'スマート BOM',
    description:
      '調達データ、代替品、リスク指標を含む完全な部品表。すべての部品がソースまでトレース可能です。',
    icon: '📦',
  },
  {
    title: 'KiCad 生成',
    description:
      '自動化的な回路図と PCB 生成。Raino は提案ではなく、製造準備完了の KiCad プロジェクトを出力します。',
    icon: '⚡',
  },
  {
    title: '製造への引き渡し',
    description:
      'プレビュー、ダウンロード、概算見積もり、オプションの PCBA 引き渡し。設計から量産まで必要なすべて。',
    icon: '🚀',
  },
];

const workflowSteps = [
  { num: 1, title: '自然言語入力', desc: '日常言語でハードウェアを記述' },
  { num: 2, title: '明確化の質問', desc: 'Raino が進行前に曖昧さを解消' },
  { num: 3, title: '構造化仕様', desc: '検証付きの正式な要件定義' },
  { num: 4, title: 'アーキテクチャ選択', desc: '要件にマッチする検証済みテンプレート' },
  { num: 5, title: '部品ファミリー選択', desc: '調達データ付きの候補コンポーネント' },
  { num: 6, title: 'ドキュメント取り込み', desc: 'データシート、エラッタ、アプリケーションノートの分析' },
  { num: 7, title: 'サプライヤーメタデータ', desc: 'サプライヤーからの実価格、在庫、最小発注数量' },
  { num: 8, title: 'RAG 推論', desc: 'エンジニアリング知識による設計判断のサポート' },
  { num: 9, title: 'BOM 生成', desc: '代替品とリスク指標を含む完全な部品表' },
  { num: 10, title: 'KiCad プロジェクト', desc: '製造準備完了の回路図と PCB ファイル' },
  { num: 11, title: '検証とエクスポート', desc: 'ERC/DRC チェックと製造ファイルのエクスポート' },
  { num: 12, title: '見積もりと引き渡し', desc: '信頼区間付きの概算見積もり' },
];

const testimonials = [
  {
    quote:
      'Raino は初期の回路図設計時間を2週間から3日に短縮しました。構造化仕様により、シニアエンジニアはピン配列ではなく設計意図をレビューできるようになりました。',
    author: 'エンジニアリングリード',
    company: '産業用 IoT スタートアップ',
    color: '#1565C0',
  },
  {
    quote:
      'リアルな代替品付き BOM は2023年の半導体不足時に救いになりました。Raino は発注前にライフサイクルリスクをフラグしてくれていました。',
    author: 'ハードウェアエンジニア',
    company: 'ロボティクス企業',
    color: '#6191D3',
  },
  {
    quote:
      'モータドライバを一段落で記述しただけで、ERC 全パスの KiCad プロジェクトが完成しました。明確化の質問で見落としていた電圧レベルの不一致を検出してくれました。',
    author: '創業者',
    company: '農業センサープラットフォーム',
    color: '#4CAF50',
  },
];

const integrationLogos = [
  { name: 'Kimi', category: 'LLM', color: '#1565C0' },
  { name: 'Supabase', category: 'データベース', color: '#4CAF50' },
  { name: 'DigiKey', category: 'サプライヤー', color: '#FF9800' },
  { name: 'Mouser', category: 'サプライヤー', color: '#FF9800' },
  { name: 'JLCPCB', category: '製造', color: '#1565C0' },
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
      <span className="px-2 py-1 text-[#E2E8F0] font-semibold">日本語</span>
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
          <span className="text-sm text-[#94A3B8]">MIT ライセンス · オープンソース</span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#E2E8F0] leading-tight mb-6">
          <span className="text-[#1565C0]">構造化インテリジェンス</span>で PCB を設計
        </h1>
        <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10">
          Raino は曖昧なハードウェア要件を構造化仕様に変換し、検証済みアーキテクチャを選択して、完全な監査証跡付き KiCad プロジェクトを生成します。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            className="px-8 py-4 bg-[#1565C0] text-white font-semibold rounded-xl hover:bg-[#1976D2] transition-all duration-300"
          >
            はじめる
          </a>
          <a
            href="https://github.com/tudsds/raino"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] font-semibold rounded-xl hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-300"
          >
            GitHub で見る
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
            ハードウェア出荷に必要な<span className="text-[#1565C0]">すべて</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            自然言語から製造への引き渡しまで。Raino は制約付きエージェントと形式的検証でワークフロー全体を処理します。
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
            <span className="text-[#1565C0]">エンジニア</span>に愛されて
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Raino を導入したチームは、より速いイテレーション、少ない回路図エラー、ハードウェアとソフトウェアエンジニア間の明確なコミュニケーションを報告しています。
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
            <span className="text-[#1565C0]">業界最高水準のツール</span>で駆動
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Raino は業界標準のサプライヤー、データベース、設計ツールと統合します。すべての接続に正直なフォールバックモードがあります。
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
            すべての統合を見る
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
              システム<span className="text-[#1565C0]">アーキテクチャ</span>
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Raino は明確な境界を持つモジュラーシステムとして構築されています。マーケティングサイトとプロダクトスタジオは、明確に定義された API を通じてワーカーサービスと通信します。
            </p>
            <ul className="space-y-3">
              {[
                'マーケティングサイト — 公開情報とドキュメント',
                'プロダクトスタジオ — 設計ワークフローアプリケーション',
                'コアパッケージ — Schema、検証、ドメインロジック、RAG、LLM ゲートウェイ',
                'ワーカーサービス — インジェスト、デザイン、見積もり、監査',
                '外部境界 — Supabase、KiCad CLI、サプライヤー API',
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
              アーキテクチャ全体を見る
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
            <span className="text-[#1565C0]">仕組み</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            自然言語から製造への引き渡しまで、12ステップのワークフロー。各ステップに形式的検証と監査証跡があります。
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
          オープン<span className="text-[#1565C0]">ソース</span>
        </h2>
        <p className="text-[#94A3B8] mb-8">
          Raino は MIT ライセンスです。コードベース全体が GitHub で公開されています。コントリビュート、フォーク、または独自インスタンスのデプロイが可能です。
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
            GitHub で見る
          </a>
          <span className="px-4 py-2 bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] text-sm font-mono rounded-lg">
            MIT ライセンス
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
