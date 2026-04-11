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

该平台包含一个营销网站、一个产品工作室应用、一个用于工程知识的 RAG（检索增强生成）流水线、一个报价引擎、一个审计追踪系统，以及用于外部供应商和 KiCad EDA 工具的适配器。全部代码基于 MIT 许可证开源。

## 为什么需要 Raino？

设计一块 PCB 不是一步完成的。它是一个从模糊想法到 Gerber 文件、物料清单（BOM）和制造交付的漫长工作流。在这个过程中，你需要选择元器件、验证引脚兼容性、检查勘误表、解决封装冲突、运行电气规则检查、并从供应商获取成本估算。每个环节都可能出现错误，而硬件错误的修复成本很高。

现有的工具大多将这些步骤视为独立的问题。EDA 工具处理布局但不处理采购。供应商搜索工具处理定价但不处理设计规则。基于聊天的助手可以推荐元器件，但无法根据真实原理图进行验证。Raino 将整个工作流整合在一起，配有正式的检查点、来源追踪和禁止虚假数据的策略。它从不编造元器件型号，从不使用估算数据时声称是实时价格，从不跳过关键歧义而不停下来询问。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户                                   │
│                                                              │
│  ┌──────────────┐              ┌──────────────────────┐      │
│  │  apps/site   │              │    apps/studio       │      │
│  │  营销网站    │───CTA──────▶│    产品应用          │      │
│  │  (端口 3000) │              │    (端口 3001)       │      │
│  └──────────────┘              └──────┬───────────────┘      │
│                                       │                      │
│                              API 路由  │                     │
│                                       ▼                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 packages/core                         │     │
│  │  Schema · 验证 · 报价引擎 · 领域逻辑                  │     │
│  └──┬──────────┬──────────┬──────────┬──────────┬───────┘    │
│     │          │          │          │          │             │
│  packages/  packages/  packages/  packages/  packages/        │
│  agents      rag     kicad-w-c  supplier-c  ui               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 Worker 服务                            │     │
│  │  ingest-worker · design-worker · quote-worker · audit  │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 产品工作流

```
自然语言输入
         │
         ▼
澄清问题循环
         │
         ▼
结构化产品规格
         │
         ▼
已批准架构模板选择
         │
         ▼
候选元器件系列选择
         │
         ▼
官方工程文档导入
         │
         ▼
结构化供应商元数据解析
         │
         ▼
RAG 辅助工程推理
         │
         ▼
完整 BOM（含替代料，KiCad 就绪）
         │
         ▼
KiCad 项目生成
         │
         ▼
ERC/DRC/导出工作流
         │
         ▼
预览资源生成
         │
         ▼
可下载文件生成
         │
         ▼
Raino 粗略报价生成
         │
         ▼
可选"向 Raino 请求 PCBA 报价"交付
```

## 仓库结构

```
raino/
├── apps/
│   ├── site/                # Next.js 营销网站（端口 3000）
│   └── studio/              # Next.js 产品应用（端口 3001）
├── packages/
│   ├── core/                # Zod schema、验证、领域逻辑
│   ├── rag/                 # 分块、嵌入、检索
│   ├── agents/              # 工作流合约、编排
│   ├── ui/                  # 赛博朋克设计系统（React + Tailwind）
│   ├── kicad-worker-client/ # KiCad CLI 合约和客户端接口
│   └── supplier-clients/    # 供应商适配器接口
├── services/
│   ├── ingest-worker/       # 文档导入流水线
│   ├── design-worker/       # KiCad 项目生成
│   ├── quote-worker/        # 粗略报价引擎
│   └── audit-worker/        # 追踪、清单、来源记录
├── docs/
│   ├── architecture/        # 系统架构文档
│   ├── api/                 # API 参考
│   ├── deployment/          # 部署指南
│   ├── ingestion/           # 导入流水线文档
│   ├── security/            # 安全模型文档
│   └── ux/                  # UX 设计语言
├── prompts/                 # 代理提示词和评估标准
├── data/                    # 种子数据和固件
├── examples/                # 示例项目和用法
├── scripts/                 # 构建和工具脚本
├── tests/                   # 集成和端到端测试
├── AGENTS.md                # 开发代理说明
├── LICENSE                  # MIT 许可证
├── package.json             # 根包配置
├── pnpm-workspace.yaml      # Monorepo 工作区定义
├── turbo.json               # Turborepo 任务配置
├── tsconfig.json            # 根 TypeScript 配置
└── vercel.json              # Vercel 部署配置
```

## 主要包和服务

| 名称                         | 用途                                      | 位置                           |
| ---------------------------- | ----------------------------------------- | ------------------------------ |
| `@raino/site`                | 营销网站，含首页、功能介绍、架构概览      | `apps/site`                    |
| `@raino/studio`              | 产品应用：需求输入、规格、BOM、预览、报价 | `apps/studio`                  |
| `@raino/core`                | Zod schema、验证、报价引擎、领域类型      | `packages/core`                |
| `@raino/rag`                 | 工程感知分块、嵌入合约、检索              | `packages/rag`                 |
| `@raino/agents`              | 工作流状态机、代理提示词、编排            | `packages/agents`              |
| `@raino/ui`                  | 共享 React 组件库，赛博朋克主题           | `packages/ui`                  |
| `@raino/kicad-worker-client` | KiCad CLI 命令合约、作业类型              | `packages/kicad-worker-client` |
| `@raino/supplier-clients`    | DigiKey、Mouser、JLCPCB 适配器接口        | `packages/supplier-clients`    |
| `ingest-worker`              | 8 阶段文档导入流水线                      | `services/ingest-worker`       |
| `design-worker`              | KiCad 项目生成和导出                      | `services/design-worker`       |
| `quote-worker`               | 带置信度区间的粗略报价计算                | `services/quote-worker`        |
| `audit-worker`               | 审计追踪、文件清单、来源记录              | `services/audit-worker`        |

## 外部 API 与边界

Raino 与多个外部系统交互。每个系统都被视为具有明确定义合约的严格边界。

### KiCad（GPL 边界）

KiCad 是一个外部 GPL 许可的 EDA 工具。Raino 不嵌入 KiCad 代码。通信通过 `packages/kicad-worker-client` 中定义的 CLI 命令（`kicad-cli`）进行。生成的 KiCad 设计和 KiCad 库文件可能携带与 Raino 本身不同的许可条款。

### 供应商适配器

Raino 在 `packages/supplier-clients` 中为 DigiKey、Mouser 和 JLCPCB 定义了适配器接口。这些接口使用接口 + 适配器模式。不假设存在实时 API 凭据。当凭据缺失时，系统在固件模式下运行，并清晰标注估算数据。

### RAG 边界

`packages/rag` 中的 RAG 系统处理工程文档的嵌入和检索。它通过可插拔接口连接嵌入服务。在固件模式下，嵌入使用内存存储。

## RAG 的范围与非范围

### RAG 用于

- 数据手册和元器件规格
- 制造商发布的勘误文档
- 应用笔记和参考设计
- 封装外形和焊盘图案
- 用于设计决策的工程知识检索

### RAG 不用于

- 实时定价数据
- 库存可用性
- 最小起订量
- 下单操作
- 任何变化速度快于文档导入能跟上的数据

实时定价、库存和下单由供应商适配器专门处理。报价的权威来源始终是结构化的供应商适配器输出，而非 RAG 检索结果。

## 充分性检查

Raino 在生成任何设计之前会运行正式的充分性检查。该检查验证所有必需数据是否已存在且一致。检查内容包括：

- 每个候选元器件都有官方数据手册
- 如果供应商发布勘误，则勘误文档存在
- 复杂元器件有应用笔记
- 封装和焊盘文档可用
- 结构化采购字段已填充
- 每个 BOM 行都有封装映射
- 所有非定制元器件都有替代料
- 跨文档没有未解决的矛盾
- 没有关键占位符残留

如果充分性检查未通过，Raino 会报告具体的缺失项，不会进入设计生成阶段。用户必须解决缺失项或明确接受风险后才能继续。

## KiCad Worker 边界

Raino 将 KiCad 用作外部 worker，而非嵌入式依赖。边界工作方式如下：

1. `packages/kicad-worker-client` 定义 CLI 命令合约和作业类型
2. `services/design-worker` 向 KiCad CLI 发送作业
3. KiCad 生成 `.kicad_pro`、`.kicad_sch`、`.kicad_pcb` 和导出文件
4. Raino 使用 ERC（电气规则检查）和 DRC（设计规则检查）验证输出
5. 从 KiCad 输出生成预览资源（SVG、PDF、GLB）

Raino 仓库中不包含任何 KiCad 源代码。KiCad 库和生成的设计有独立的许可条款，与 Raino 的 MIT 许可证分开。

## 预览与下载流程

设计通过验证后，Raino 生成多种预览和下载文件：

| 文件        | 格式      | 说明                            |
| ----------- | --------- | ------------------------------- |
| 原理图预览  | SVG、PDF  | 电路原理图渲染                  |
| PCB 2D 预览 | SVG       | 顶层和底层铜箔视图              |
| PCB 3D 预览 | GLB       | 交互式 3D 板模型                |
| BOM 导出    | CSV、JSON | 含替代料的完整物料清单          |
| Gerber 文件 | RS-274X   | 制造就绪的 PCB 文件             |
| 制造文件包  | ZIP       | Gerber、BOM、贴片文件、钻孔文件 |

所有文件都附带校验和和来源元数据清单。

## 报价流程

`services/quote-worker` 中的报价引擎生成带三个置信度区间的粗略成本估算。

### 计算公式

```
小计 = 设计自动化费
     + 工程审查费
     + PCB 制造估算
     + 元器件估算
     + 组装估算
     + QA 包装处理费

中间报价 = 小计 + 不可预见费 + 利润
低报价 = 中间报价 * 0.8
高报价 = 中间报价 * 1.25
```

### 费用组成

| 组件           | 默认值                      |
| -------------- | --------------------------- |
| 设计自动化费   | $500                        |
| 工程审查费     | $300                        |
| PCB 制造       | $0.10/cm²（估算板面积）     |
| 组装           | $0.05/个元器件贴装          |
| QA、包装、处理 | $100 基础 + $0.50/件        |
| 不可预见费     | 小计的 10%                  |
| 利润           | （小计 + 不可预见费）的 15% |

### 置信度等级

| 等级   | 标准                                     |
| ------ | ---------------------------------------- |
| **高** | 所有 BOM 行都有真实供应商价格            |
| **中** | 70% 以上的行有真实价格，30% 或更少为估算 |
| **低** | 超过 30% 的行使用估算价格                |

每份报价都包含完整的假设列表。当任何元器件价格来自固件数据而非实时供应商查询时，报价会被明确标注为估算。

## Raino 交付流程

粗略报价生成后，用户可以选择向 Raino 请求 PCBA（印制电路板组装）报价。该交付流程：

1. 用户审查粗略报价和假设
2. 用户点击"向 Raino 请求 PCBA 报价"
3. Raino 提交包含报价 ID 和所需数量的订单意向
4. 创建带有状态追踪的交付记录
5. 用户收到确认并可以追踪进度

这是可选步骤。用户可以下载所有制造文件，选择任何他们想要的制造商。

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
pnpm dev
```

### 启动内容

`pnpm dev` 执行后，两个应用启动：

- **营销网站**：`http://localhost:3000`
- **产品工作室**：`http://localhost:3001`

初始设置不需要供应商 API 密钥。没有密钥时，系统在固件模式下运行，带有标注的估算数据。

## 本地开发

### 运行单个应用

```bash
# 仅营销网站
pnpm dev --filter @raino/site

# 仅产品工作室
pnpm dev --filter @raino/studio
```

### 构建

```bash
# 构建所有包和应用
pnpm build

# 构建特定包
pnpm build --filter @raino/core
```

### 类型检查

```bash
pnpm typecheck
```

### 代码检查

```bash
pnpm lint
```

### 格式化

```bash
pnpm format        # 写入更改
pnpm format:check  # 仅检查
```

## 环境变量

| 变量                    | 说明                   | 必需                   |
| ----------------------- | ---------------------- | ---------------------- |
| `DIGIKEY_CLIENT_ID`     | DigiKey API 客户端 ID  | 否（无则使用固件模式） |
| `DIGIKEY_CLIENT_SECRET` | DigiKey API 客户端密钥 | 否（无则使用固件模式） |
| `MOUSER_API_KEY`        | Mouser API 密钥        | 否（无则使用固件模式） |
| `JLCPCB_API_KEY`        | JLCPCB API 密钥        | 否（无则使用固件模式） |
| `EMBEDDING_API_KEY`     | 嵌入服务 API 密钥      | 否（无则使用模拟模式） |
| `EMBEDDING_MODEL`       | 嵌入模型标识符         | 否（无则使用模拟模式） |
| `NEXTAUTH_SECRET`       | NextAuth.js 会话密钥   | 否（开发环境开放）     |
| `NEXTAUTH_URL`          | NextAuth.js 回调 URL   | 否（开发环境开放）     |

没有供应商 API 密钥时，Raino 使用固件数据进行元器件定价。所有来自固件的数据在 UI 和审计追踪中都被标注为估算。系统从不声称在使用固件时有实时连接。

## 测试与审计

### 测试命令

```bash
# 运行所有测试
pnpm test

# 仅单元测试
pnpm test:unit

# 仅集成测试
pnpm test:integration

# 仅端到端测试
pnpm test:e2e
```

### 测试要求

Raino 执行严格的测试标准：

- 每个 Zod schema 必须有解析成功和解析失败的测试
- 报价引擎必须有验证精确数值结果的基准输出测试
- 导入流水线必须有确认通过/失败行为的充分性检查测试
- RAG 检索必须有确认来源归属的来源验证测试
- 必须测试失败模式，包括虚假元器件、缺失勘误和矛盾文档

### 审计追踪

审计 worker 记录每一个重要操作。追踪内容包括：

- 带来源记录的 BOM 决策
- 元器件选择理由
- 带校验和的文件清单
- 报价假设和置信度等级
- 策略违规标记

审计追踪可通过 API 在 `GET /api/projects/:id/audit` 检查。

## 部署

Raino 面向 Vercel 部署设计，使用 Turborepo 构建编排。

### 步骤

1. Fork 或推送仓库到 GitHub
2. 将 GitHub 仓库连接到 Vercel
3. 将根目录设置为 `/`（monorepo 根目录）
4. Vercel 从 `vercel.json` 自动检测 Next.js 应用
5. 在 Vercel 控制台中设置环境变量
6. 部署

### 预览与生产

- 每个拉取请求自动获得预览部署
- 合并到 main 分支触发生产部署

### 构建配置

根目录的 `vercel.json` 指定：

- `buildCommand`：`pnpm build`
- `installCommand`：`pnpm install`
- Turborepo 处理内部构建顺序

## 路线图

- 用户认证和项目所有权
- 实时供应商 API 集成（DigiKey、Mouser、JLCPCB）
- 生产级向量数据库用于 RAG
- 多用户协作编辑
- 设计版本控制（差异、分支、合并）
- 扩展架构模板库
- IPC-2581 和 ODB++ 导出格式
- 按制造商定制设计规则
- 自动化 DFM（可制造性设计）检查
- 供应商库存变化时的实时定价提醒
- 元器件生命周期和停产追踪
- 多语言 UI（中文、日文、韩文）

## 贡献

欢迎贡献。贡献步骤：

1. Fork 仓库
2. 从 `main` 创建功能分支
3. 进行更改并编写测试
4. 运行 `pnpm typecheck`、`pnpm lint` 和 `pnpm test` 验证
5. 提交带有清晰描述的拉取请求

### 代码规范

- TypeScript 严格模式。禁止使用 `as any`、`@ts-ignore` 或 `@ts-expect-error`
- 禁止空 catch 块
- 所有公共函数必须有测试
- 遵循现有的项目结构和模式
- 提交信息应清晰描述更改内容

### 应避免的反模式

- 删除测试以通过构建
- 将用户需求简化为演示
- 添加功能而不编写对应测试
- 提交凭据或密钥

## 常见问题

**Raino 是聊天机器人吗？**

不是。Raino 是一个具有自然语言输入步骤的结构化工作流系统。它使用受约束的代理配合正式的状态机、充分性检查和审计追踪。它不会生成开放式回复或做出未经验证的设计决策。

**使用 Raino 需要安装 KiCad 吗？**

对于不涉及设计生成的本地开发，不需要。要生成实际的 KiCad 项目，你需要安装 KiCad 并且 `kicad-cli` 在 PATH 中可用。没有 KiCad 时，设计 worker 在模拟模式下运行。

**报价有多准确？**

报价是粗略估算。准确度取决于置信度等级。"高"置信度表示大多数价格来自实时供应商数据。"低"置信度表示大多数价格是固件估算。每份报价都包含详细的假设列表供你自行判断。

**我可以使用自己的供应商而不使用 Raino 的交付服务吗？**

可以。所有制造文件（Gerber、BOM、贴片文件）都可以下载。你可以发送给任何 PCB 制造商或组装厂。

**供应商 API 不可用时会发生什么？**

Raino 回退到固件模式，并将所有受影响的数据清晰标注为估算。它从不静默降级。审计追踪会记录哪些数据来自固件以及时间。

**Raino 支持模拟设计吗，还是只支持数字设计？**

Raino 支持任何符合其架构模板系统的设计。当前的引导版本专注于常见的数字板架构，但模板系统可扩展到模拟和混合信号设计。

**Raino 与直接使用 ChatGPT 设计 PCB 有什么区别？**

ChatGPT 可以推荐元器件并解释概念，但无法运行 ERC/DRC、生成 KiCad 项目、查询实时供应商定价或维护可追溯的审计追踪。Raino 将 LLM 推理与结构化工程工具和正式检查点相结合。

**Raino 可以完全离线运行吗？**

可以。使用固件数据和模拟嵌入，整个系统可以离线工作。你不会有实时定价或实时供应商数据，但设计工作流、验证和文件生成都可以在没有网络连接的情况下运行。

## 许可

- **Raino**：MIT 许可证。详见 [LICENSE](LICENSE)。
- **KiCad**：外部 GPL 许可工具。未嵌入 Raino。
- **KiCad 库和生成的设计**：可能携带与 Raino 不同的许可条款。详情请查阅 KiCad 的许可文档。

Raino 不将任何 GPL 许可代码复制到其仓库中。KiCad 边界仅通过 CLI 合约维护。

## 截图

[Screenshot: Raino 营销网站首页]

[Screenshot: Raino 工作室需求输入面板，含自然语言输入]

[Screenshot: Raino 工作室 BOM 面板，含采购数据和风险指标]

[Screenshot: Raino 工作室 PCB 3D 预览，含交互式模型查看器]

[Screenshot: Raino 工作室报价面板，显示低/中/高区间和置信度]

## 来源追踪与安全

### 禁止虚假集成策略

Raino 绝不：

- 编造实时定价或库存数据
- 在使用固件数据时声称有实时 API 连接
- 在不报告的情况下静默降级到降级模式
- 在未经用户确认的情况下跳过关键歧义

每条降级模式路径都可以通过审计追踪进行检查。

### 来源追踪

Raino 中的每一个设计决策都可追溯：

- 元器件选择链接回数据手册、勘误和应用笔记
- BOM 条目记录供应商、价格来源以及价格是否为估算
- 文件附带包含校验和和生成时间戳的清单
- 报价包含完整的假设列表和置信度评分
- 策略违规会被标记并记录

### 输入验证

所有 API 输入都通过 Zod schema 验证。类型安全的解析，清晰的错误消息。不允许未类型化的数据进入系统。

### 外部边界

- KiCad 仅通过定义的 CLI 合约通信
- 供应商适配器使用接口 + 适配器模式，无直接数据库连接
- 嵌入服务通过可插拔接口连接，带有模拟回退

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT 许可证 &middot; 基于 TypeScript、Next.js 和 KiCad 构建
</p>
