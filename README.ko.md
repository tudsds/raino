<p align="center">
  <strong>Raino</strong>
</p>
<p align="center">
  에이전트 기반 PCB &amp; PCBA 워크플로우 플랫폼
</p>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/repository-tudsds%2Fraino-181717.svg)](https://github.com/tudsds/raino)

<p align="center">
  <a href="README.md">English</a> &middot; <a href="README.zh-CN.md">中文</a> &middot; <a href="README.ja.md">日本語</a> &middot; <a href="README.ko.md">한국어</a> &middot; <a href="docs/">문서</a>
</p>

---

## Raino란 무엇인가?

Raino는 제약 기반, 감사 가능, 소스 추적 가능한 하드웨어 설계 및 제조 인계 시스템입니다. 자연어로 표현된 모호한 하드웨어 요구사항을 구조화된 제품 사양으로 변환하고, 승인된 아키텍처를 선택하고, 실제 공급업체에서 조달 데이터를 확인하며, KiCad 프로젝트를 생성하고, 대략적인 비용 견적과 함께 제조 번들을 생성합니다.

Raino는 챗봇이 아닙니다. 제약 없는 자율 PCB 오토파일럿도 아닙니다. 모든 설계 결정은 승인된 아키텍처 템플릿으로 제한되고, 모든 부품 선택은 소스까지 추적 가능하며, 모든 견적은 실시간 공급업체 데이터와 픽스처 추정치를 명확하게 구분합니다.

플랫폼은 2개의 프론트엔드 앱, 8개의 공유 패키지, 4개의 워커 서비스로 구성됩니다. Supabase로 영속화와 인증, Kimi K2.5로 LLM 추론, 픽셀 아트 사이버펑크 디자인 시스템을 사용합니다. 모든 코드는 MIT 라이선스로 오픈소스입니다.

## 저장소 구조

```
raino/
├── apps/
│   ├── site/                # Next.js 15 마케팅 사이트 (포트 3000)
│   └── studio/              # Next.js 15 제품 앱 (포트 3001)
├── packages/
│   ├── core/                # Zod 스키마, 검증, 도메인 로직
│   ├── db/                  # Prisma ORM + Supabase 인증/스토리지/pgvector 클라이언트
│   ├── llm/                 # Kimi K2.5 모델 게이트웨이 (OpenAI 호환 SDK)
│   ├── rag/                 # 청킹, 임베딩, 검색 (Supabase pgvector)
│   ├── agents/              # 워크플로우 계약, 상태 머신, 오케스트레이션
│   ├── ui/                  # 픽셀 아트 사이버펑크 디자인 시스템 (React + Tailwind v4)
│   ├── kicad-worker-client/ # KiCad CLI 계약 및 클라이언트 인터페이스
│   └── supplier-clients/    # 공급업체 어댑터 인터페이스 + 팩토리
├── services/
│   ├── ingest-worker/       # 문서 인제스트 파이프라인
│   ├── design-worker/       # KiCad 프로젝트 생성
│   ├── quote-worker/        # 대략적 견적 엔진
│   └── audit-worker/        # 추적, 매니페스트, 출처 기록
├── docs/                    # 문서
├── .env.example             # 20개 환경 변수 플레이스홀더
├── pnpm-workspace.yaml      # 모노레포 워크스페이스 정의
├── turbo.json               # Turborepo 작업 설정
└── vercel.json              # Vercel 배포 설정
```

## 기술 스택

| 계층         | 기술                                                     |
| ------------ | -------------------------------------------------------- |
| 프론트엔드   | Next.js 15, React 19, Tailwind CSS v4                    |
| 디자인       | @raino/ui (픽셀 아트 사이버펑크, Press Start 2P + VT323) |
| 백엔드       | Next.js Route Handlers, Server Actions, Supabase         |
| 데이터베이스 | Supabase Postgres, Prisma ORM, pgvector                  |
| 인증         | Supabase Auth (매직 링크)                                |
| LLM          | Kimi K2.5 via OpenAI SDK (moonshot.ai)                   |
| 검증         | Zod                                                      |
| 테스트       | Vitest                                                   |
| 빌드         | Turborepo, pnpm workspaces                               |
| 배포         | Vercel (모노레포, 2개 앱)                                |

## 시스템 아키텍처

![Architecture](docs/assets/architecture-overview.svg)

## 워크플로우 파이프라인

![Pipeline](docs/assets/architecture-pipeline.svg)

## 저하/픽스처 모드

자격 증명이 없으면 Raino는 저하 모드로 실행됩니다. 모든 저하 경로는 명확하게 라벨링됩니다.

| 누락된 자격 증명   | 여전히 작동하는 것        | 폴백 동작                      |
| ------------------ | ------------------------- | ------------------------------ |
| Supabase 자격 증명 | 정적 페이지, UI 렌더링    | 인증, 프로젝트 영속화, RAG     |
| `KIMI_API_KEY`     | LLM 호출 외 모든 기능     | 자연어 인테이크, 에이전트 추론 |
| 공급업체 API 키    | 모든 설계 워크플로우 단계 | 실시간 가격, 재고, MOQ 데이터  |
| KiCad CLI          | 프로젝트 관리, BOM, 견적  | 실제 KiCad 프로젝트 생성       |

## 시작하기

### 전제 조건

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### 클론 및 설치

```bash
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install
cp .env.example .env.local
# .env.local 편집하여 자격 증명 입력 (.env.example의 20개 변수 참조)
pnpm dev
```

두 애플리케이션이 시작됩니다:

- **마케팅 사이트**: `http://localhost:3000`
- **제품 스튜디오**: `http://localhost:3001`

## 환경 변수

`.env.example`를 참조하세요. 주요 변수:

| 변수                        | 용도                      | 필수                   |
| --------------------------- | ------------------------- | ---------------------- |
| `KIMI_API_KEY`              | Moonshot API 키           | 아니오 (LLM 호출 실패) |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase 프로젝트 URL     | 아니오 (저하 모드)     |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키     | 아니오 (저하 모드)     |
| `DIGIKEY_CLIENT_ID`         | DigiKey API 클라이언트 ID | 아니오 (픽스처 모드)   |
| `MOUSER_API_KEY`            | Mouser API 키             | 아니오 (픽스처 모드)   |
| `JLCPCB_APP_ID`             | JLCPCB API 앱 ID          | 아니오 (픽스처 모드)   |
| `JLCPCB_ACCESS_KEY`         | JLCPCB API 액세스 키      | 아니오 (픽스처 모드)   |
| `JLCPCB_SECRET_KEY`         | JLCPCB API 시크릿 키      | 아니오 (픽스처 모드)   |

## 배포

- **마케팅 사이트**: [raino-site.vercel.app](https://raino-site.vercel.app)
- **제품 스튜디오**: [raino-studio.vercel.app](https://raino-studio.vercel.app)

## 기여

기여를 환영합니다. 저장소를 포크하고, `main`에서 기능 브랜치를 생성하고, 테스트를 작성한 후, `pnpm typecheck`, `pnpm lint`, `pnpm test`를 실행하여 검증하고 풀 리퀘스트를 생성하세요.

## 라이선스

- **Raino**: MIT 라이선스. 자세한 내용은 [LICENSE](LICENSE) 참조.
- **KiCad**: 외부 GPL 라이선스 도구. Raino에 임베드되지 않음.

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT 라이선스 &middot; TypeScript, Next.js 15, Supabase, KiCad로 구축
</p>
