<p align="center">
  <strong>Raino</strong>
</p>
<p align="center">
  智能代理 PCB 与 PCBA 工作流平台
</p>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/repository-tudsds%2Fraino-181717.svg)](https://github.com/tudsds/raino)

---

## Raino 是什么？

Raino 是一个受约束的、可审计的、来源可追溯的硬件设计与制造交付系统。它将用户用自然语言表达的模糊硬件需求转化为结构化的产品规格，选择已批准的架构模板，从真实供应商处获取采购数据，生成 KiCad 项目，并产出附带成本估算的制造文件包。

Raino 不是一个聊天机器人，也不是一个不受约束的自动 PCB 设计工具。每一个设计决策都受限于已批准的架构模板，每一个元器件选择都可追溯到其来源，每一份报价都清楚地区分了实时供应商数据和固件估算数据。系统在生成任何设计之前都会运行正式的充分性检查，遇到无法解决的歧义时会停下来请求人工介入。

平台包含两个前端应用、八个共享包和四个 worker 服务。使用 Supabase 做持久化和认证，Kimi K2.5 做 LLM 推理，iOS 26 液态玻璃设计系统。全部代码基于 MIT 许可证开源。

## 仓库结构

```
raino/
├── apps/
│   ├── site/                # Next.js 15 营销网站（端口 3000）
│   └── studio/              # Next.js 15 产品应用（端口 3001）
├── packages/
│   ├── core/                # Zod schema、验证、领域逻辑
│   ├── db/                  # Prisma ORM + Supabase 认证/存储/pgvector 客户端
│   ├── llm/                 # Kimi K2.5 模型网关（OpenAI 兼容 SDK）
│   ├── rag/                 # 分块、嵌入、检索（Supabase pgvector）
│   ├── agents/              # 工作流合约、状态机、编排
│   ├── ui/                  # iOS 26 液态玻璃设计系统（React + Tailwind v4）
│   ├── kicad-worker-client/ # KiCad CLI 合约和客户端接口
│   └── supplier-clients/    # 供应商适配器接口 + 工厂
├── services/
│   ├── ingest-worker/       # 文档导入流水线
│   ├── design-worker/       # KiCad 项目生成
│   ├── quote-worker/        # 粗略报价引擎
│   └── audit-worker/        # 追踪、清单、来源记录
├── docs/                    # 文档
├── .env.example             # 20 个环境变量占位符
├── pnpm-workspace.yaml      # Monorepo 工作区定义
├── turbo.json               # Turborepo 任务配置
└── vercel.json              # Vercel 部署配置
```

## 技术栈

| 层级   | 技术                                                  |
| ------ | ----------------------------------------------------- |
| 前端   | Next.js 15, React 19, Tailwind CSS v4                 |
| 设计   | @raino/ui（iOS 26 液态玻璃, Noto Serif） |
| 后端   | Next.js Route Handlers, Server Actions, Supabase      |
| 数据库 | Supabase Postgres, Prisma ORM, pgvector               |
| 认证   | Supabase Auth（魔法链接）                             |
| LLM    | Kimi K2.5 通过 OpenAI SDK（moonshot.ai）              |
| 验证   | Zod                                                   |
| 测试   | Vitest                                                |
| 构建   | Turborepo, pnpm workspaces                            |
| 部署   | Vercel（monorepo，两个应用）                          |

## 降级/固件模式

缺少凭据时 Raino 在降级模式下运行。这不是秘密，应用会清晰标注每条降级路径。

| 缺少的凭据      | 仍然可用                | 回退行为                   |
| --------------- | ----------------------- | -------------------------- |
| Supabase 凭据   | 静态页面, UI 渲染       | 认证, 项目持久化, RAG      |
| `KIMI_API_KEY`  | 除 LLM 调用外的所有功能 | 自然语言输入, 代理推理     |
| 供应商 API 密钥 | 所有设计工作流步骤      | 实时定价, 库存, 起订量数据 |
| KiCad CLI       | 项目管理, BOM, 报价     | 实际 KiCad 项目生成        |

Mock 适配器和固件数据是代码库的永久组成部分，不是临时补丁。

## 快速开始

### 前置条件

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### 克隆与安装

```bash
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install
cp .env.example .env.local
# 编辑 .env.local 填入凭据（参见 .env.example 中的 20 个变量）
pnpm dev
```

两个应用启动：

- **营销网站**：`http://localhost:3000`
- **产品工作室**：`http://localhost:3001`

没有任何凭据时，两个应用都在降级模式下渲染 UI。

## 环境变量

参见 `.env.example` 获取所有 20 个占位符。关键变量：

| 变量                            | 用途                  | 必需               |
| ------------------------------- | --------------------- | ------------------ |
| `KIMI_API_KEY`                  | Moonshot API 密钥     | 否（LLM 调用失败） |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 项目 URL     | 否（降级模式）     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥     | 否（降级模式）     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase 服务角色密钥 | 否（降级模式）     |
| `DIGIKEY_CLIENT_ID`             | DigiKey API 客户端 ID | 否（固件模式）     |
| `MOUSER_API_KEY`                | Mouser API 密钥       | 否（固件模式）     |
| `JLCPCB_APP_ID`                 | JLCPCB API 应用 ID    | 否（固件模式）     |
| `JLCPCB_ACCESS_KEY`             | JLCPCB API 访问密钥   | 否（固件模式）     |
| `JLCPCB_SECRET_KEY`             | JLCPCB API 签名密钥   | 否（固件模式）     |

## 在线部署

- **营销网站**：[raino-site.vercel.app](https://raino-site.vercel.app)
- **产品工作室**：[raino-studio.vercel.app](https://raino-studio.vercel.app)

## 贡献

欢迎贡献。请 Fork 仓库，从 `main` 创建功能分支，编写测试，运行 `pnpm typecheck`、`pnpm lint` 和 `pnpm test` 验证后提交 Pull Request。

## 许可

- **Raino**：MIT 许可证。详见 [LICENSE](LICENSE)。
- **KiCad**：外部 GPL 许可工具。未嵌入 Raino。

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT 许可证 &middot; 基于 TypeScript、Next.js 15、Supabase 和 KiCad 构建
</p>
