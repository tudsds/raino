<p align="center">
  <strong>Raino</strong>
</p>
<p align="center">
  エージェント型 PCB &amp; PCBA ワークフロープラットフォーム
</p>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/repository-tudsds%2Fraino-181717.svg)](https://github.com/tudsds/raino)

---

## Raino とは

Raino は、制約付き・監査可能・ソーストレーサブルなハードウェア設計・製造引き渡しシステムです。自然言語で表現された曖昧なハードウェア要件を構造化された製品仕様に変換し、承認済みアーキテクチャを選択し、実在のサプライヤーから調達データを取得し、KiCad プロジェクトを生成し、概算コスト見積もり付きの製造バンドルを生成します。

Raino はチャットボットではありません。無制約の自律 PCB オートパイロットでもありません。すべての設計判断は承認済みアーキテクチャテンプレートに制約され、すべての部品選択はソースにトレース可能で、すべての見積もりはリアルタイムサプライヤーデータとフィクスチャ推定値を明確に区別します。

プラットフォームは 2 つのフロントエンドアプリ、8 つの共有パッケージ、4 つのワーカーサービスで構成されています。Supabase で永続化と認証、Kimi K2.5 で LLM 推理、ピクセルアートサイバーパンクデザインシステムを使用。すべて MIT ライセンスでオープンソースです。

## リポジトリ構成

```
raino/
├── apps/
│   ├── site/                # Next.js 15 マーケティングサイト（ポート 3000）
│   └── studio/              # Next.js 15 プロダクトアプリ（ポート 3001）
├── packages/
│   ├── core/                # Zod スキーマ、バリデーション、ドメインロジック
│   ├── db/                  # Prisma ORM + Supabase 認証/ストレージ/pgvector クライアント
│   ├── llm/                 # Kimi K2.5 モデルゲートウェイ（OpenAI 互換 SDK）
│   ├── rag/                 # チャンキング、エンベディング、検索（Supabase pgvector）
│   ├── agents/              # ワークフロー契約、状態マシン、オーケストレーション
│   ├── ui/                  # ピクセルアートサイバーパンクデザインシステム（React + Tailwind v4）
│   ├── kicad-worker-client/ # KiCad CLI 契約とクライアントインターフェース
│   └── supplier-clients/    # サプライヤーアダプターインターフェース + ファクトリ
├── services/
│   ├── ingest-worker/       # ドキュメントインジェストパイプライン
│   ├── design-worker/       # KiCad プロジェクト生成
│   ├── quote-worker/        # 概算見積もりエンジン
│   └── audit-worker/        # トレース、マニフェスト、プロベナンス
├── docs/                    # ドキュメント
├── .env.example             # 20 の環境変数プレースホルダー
├── pnpm-workspace.yaml      # モノレポワークスペース定義
├── turbo.json               # Turborepo タスク設定
└── vercel.json              # Vercel デプロイメント設定
```

## テクノロジースタック

| レイヤー       | テクノロジー                                                      |
| -------------- | ----------------------------------------------------------------- |
| フロントエンド | Next.js 15, React 19, Tailwind CSS v4                             |
| デザイン       | @raino/ui（ピクセルアートサイバーパンク, Press Start 2P + VT323） |
| バックエンド   | Next.js Route Handlers, Server Actions, Supabase                  |
| データベース   | Supabase Postgres, Prisma ORM, pgvector                           |
| 認証           | Supabase Auth（マジックリンク）                                   |
| LLM            | Kimi K2.5 via OpenAI SDK（moonshot.ai）                           |
| バリデーション | Zod                                                               |
| テスト         | Vitest                                                            |
| ビルド         | Turborepo, pnpm workspaces                                        |
| デプロイ       | Vercel（モノレポ、2 アプリ）                                      |

## 低下/フィクスチャモード

認証情報が不足している場合、Raino は低下モードで実行されます。すべての低下パスは明確にラベル付けされます。

| 不足している認証情報  | 引き続き動作するもの             | フォールバック動作                   |
| --------------------- | -------------------------------- | ------------------------------------ |
| Supabase 認証情報     | 静的ページ、UI レンダリング      | 認証、プロジェクト永続化、RAG        |
| `KIMI_API_KEY`        | LLM 呼び出し以外のすべて         | 自然言語インテイク、エージェント推論 |
| サプライヤー API キー | すべての設計ワークフローステップ | リアルタイム価格、在庫、MOQ データ   |
| KiCad CLI             | プロジェクト管理、BOM、見積もり  | 実際の KiCad プロジェクト生成        |

## はじめ方

### 前提条件

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### クローンとインストール

```bash
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install
cp .env.example .env.local
# .env.local を編集して認証情報を入力（.env.example の 20 変数を参照）
pnpm dev
```

2 つのアプリケーションが起動します：

- **マーケティングサイト**：`http://localhost:3000`
- **プロダクトスタジオ**：`http://localhost:3001`

## 環境変数

`.env.example` を参照してください。主要な変数：

| 変数                        | 用途                        | 必須                         |
| --------------------------- | --------------------------- | ---------------------------- |
| `KIMI_API_KEY`              | Moonshot API キー           | いいえ（LLM 呼び出し失敗）   |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase プロジェクト URL   | いいえ（低下モード）         |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー | いいえ（低下モード）         |
| `DIGIKEY_CLIENT_ID`         | DigiKey API クライアント ID | いいえ（フィクスチャモード） |
| `MOUSER_API_KEY`            | Mouser API キー             | いいえ（フィクスチャモード） |
| `JLCPCB_API_KEY`            | JLCPCB API キー             | いいえ（フィクスチャモード） |

## デプロイ

- **マーケティングサイト**：[raino-site.vercel.app](https://raino-site.vercel.app)
- **プロダクトスタジオ**：[raino-studio.vercel.app](https://raino-studio.vercel.app)

## コントリビューション

コントリビューションを歓迎します。リポジトリをフォークし、`main` からフィーチャーブランチを作成し、テストを書き、`pnpm typecheck`、`pnpm lint`、`pnpm test` を実行して検証後、プルリクエストを作成してください。

## ライセンス

- **Raino**：MIT ライセンス。詳しくは [LICENSE](LICENSE)。
- **KiCad**：外部 GPL ライセンスツール。Raino には組み込まれていません。

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT ライセンス &middot; TypeScript、Next.js 15、Supabase、KiCad で構築
</p>
