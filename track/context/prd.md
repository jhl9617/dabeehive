# Orchestrator — Next.js FE/BE/MCP 통합 서버 PRD

## 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | Orchestrator Next.js Monolith PRD |
| 버전 | v1.0 |
| 작성일 | 2026-05-04 |
| 구현 범위 | Next.js 15 App Router 단일 프로젝트 — FE + API Server + MCP Server |
| 선행 문서 | AI Agent Orchestrator PRD v1.0 |

---

## 1. 목적 및 범위

### 1.1 제품 목적

이 문서는 AI Agent Orchestrator의 **첫 번째 구현 대상**인 Next.js 기반 모체 서버의 요구사항을 정의한다. 단일 Next.js 15 App Router 프로젝트 안에 **프론트엔드 UI, REST API, MCP 서버를 통합**하여 오케스트레이션 플랫폼의 핵심 기반을 구성한다.[cite:191][cite:197]

이 서버는 다음 세 역할을 동시에 수행한다.

- **FE**: 프로젝트, 이슈, agent run, 승인 관리를 위한 웹 대시보드
- **BE**: 비즈니스 로직, DB, 외부 연동, 백그라운드 job을 처리하는 API 서버
- **MCP**: VS Code, Cursor, Claude Desktop 등 외부 AI 클라이언트가 접근하는 표준 MCP 게이트웨이[cite:197][cite:199]

### 1.2 구현 범위 — MVP

이 문서에서 다루는 MVP 범위는 아래와 같다.

- 사용자 인증 및 세션 관리
- 프로젝트, 이슈, 문서(PRD/ADR) CRUD
- Agent Profile 정의 및 관리
- Agent Run 실행, 상태 추적, 로그 조회
- Human Approval Gate (승인/반려)
- MCP 서버: 기본 Tools, Resources, Prompts 노출
- GitHub 연동: 저장소 연결, PR 링크 추적
- Slack 알림 발송
- 실시간 run 상태 스트리밍(SSE)
- 기본 대시보드 UI

### 1.3 구현 범위 — 제외 (후속 단계)

- 코드 실행 sandbox (별도 runner 서비스)
- Vector search / context retrieval
- Temporal 기반 durable workflow
- Figma/Linear 연동
- 배포 자동화

---

## 2. 기술 스택

### 2.1 확정 스택

| 레이어 | 기술 | 버전 | 역할 |
|---|---|---|---|
| 프레임워크 | Next.js | 15 (App Router) | FE + API + MCP 통합[cite:191] |
| 언어 | TypeScript | 5.x | 전 레이어 |
| DB | PostgreSQL | 16+ | 핵심 데이터 저장 |
| ORM | Prisma | 6.x | type-safe 쿼리, migration[cite:201] |
| MCP 어댑터 | mcp-handler (`@vercel/mcp-adapter`) | latest | Route Handler 기반 MCP 서버[cite:197][cite:199] |
| MCP SDK | `@modelcontextprotocol/sdk` | latest | tool/resource/prompt 등록[cite:187] |
| 인증 | NextAuth.js v5 | beta | App Router 호환 session 관리[cite:202] |
| Redis | ioredis | 5.x | BullMQ queue, session store, cache |
| Job Queue | BullMQ | 5.x | agent run 비동기 실행 |
| Validation | Zod | 3.x | API 입력 + MCP tool schema |
| 실시간 | SSE (내장) | — | run 상태 스트리밍, MCP transport |
| FE 상태 | TanStack Query + Zustand | latest | 서버/클라이언트 상태 분리 |
| 스타일 | Tailwind CSS | v4 | |
| GitHub 연동 | `@octokit/rest` | latest | repo, PR, checks |
| Slack 연동 | `@slack/web-api` | latest | 알림 발송 |

### 2.2 로컬 개발 환경

- Node.js 22+
- pnpm
- Docker Compose: PostgreSQL, Redis 로컬 실행
- `.env.local`: DB URL, Redis URL, NextAuth secret, GitHub/Slack/OpenAI/Anthropic API 키

---

## 3. 프로젝트 구조

### 3.1 디렉터리 구조

```
orchestrator/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx               # 사이드바, 헤더, 인증 보호
│   │   ├── page.tsx                 # 대시보드 홈
│   │   ├── projects/
│   │   │   ├── page.tsx             # 프로젝트 목록
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # 프로젝트 상세
│   │   │       ├── issues/
│   │   │       │   └── page.tsx
│   │   │       ├── documents/
│   │   │       │   └── page.tsx
│   │   │       └── runs/
│   │   │           └── page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx             # Agent Profile 목록/편집
│   │   │   └── [id]/page.tsx
│   │   ├── runs/
│   │   │   ├── page.tsx             # 전체 run 목록
│   │   │   └── [id]/page.tsx        # run 상세 + 실시간 로그
│   │   └── approvals/
│   │       └── page.tsx             # 승인 대기 센터
│   │
│   ├── api/
│   │   ├── [transport]/             # MCP 서버 엔드포인트
│   │   │   └── route.ts             # GET / POST — SSE + HTTP transport
│   │   │
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── route.ts             # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET, PATCH, DELETE
│   │   │       ├── issues/
│   │   │       │   └── route.ts
│   │   │       └── documents/
│   │   │           └── route.ts
│   │   │
│   │   ├── issues/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── delegate/
│   │   │           └── route.ts     # agent에 이슈 위임
│   │   │
│   │   ├── agents/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   │
│   │   ├── runs/
│   │   │   ├── route.ts             # POST create run
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET status, DELETE cancel
│   │   │       ├── logs/
│   │   │       │   └── route.ts     # GET logs
│   │   │       └── stream/
│   │   │           └── route.ts     # GET SSE stream
│   │   │
│   │   ├── approvals/
│   │   │   ├── route.ts             # GET list
│   │   │   └── [id]/
│   │   │       └── route.ts         # POST respond (approve/reject)
│   │   │
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   │
│   │   └── webhooks/
│   │       ├── github/
│   │       │   └── route.ts
│   │       └── slack/
│   │           └── route.ts
│   │
│   └── layout.tsx
│
├── lib/
│   ├── db/
│   │   ├── prisma.ts                # PrismaClient singleton
│   │   └── seed.ts
│   │
│   ├── mcp/
│   │   ├── server.ts                # createMcpHandler 설정
│   │   ├── tools/
│   │   │   ├── project.ts           # project.list, project.create, project.get
│   │   │   ├── issue.ts             # issue.list, issue.create, issue.delegate
│   │   │   ├── document.ts          # document.get, document.create
│   │   │   ├── agent-run.ts         # run.start, run.status, run.cancel
│   │   │   ├── approval.ts          # approval.request, approval.respond
│   │   │   └── context-search.ts    # context.search (MVP: keyword only)
│   │   ├── resources/
│   │   │   ├── project.ts           # project://{id}/summary
│   │   │   ├── issue.ts             # issue://{id}
│   │   │   └── document.ts          # document://{type}/{projectId}/latest
│   │   └── prompts/
│   │       ├── decompose-epic.ts    # Epic → Issue 분해
│   │       ├── generate-prd.ts      # PRD 초안 생성
│   │       └── triage-issue.ts      # 이슈 triage
│   │
│   ├── orchestrator/
│   │   ├── workflow.ts              # 프로젝트/이슈/run 상태머신
│   │   ├── delegator.ts             # 역할별 agent 라우팅
│   │   └── policy.ts                # 승인 정책 규칙 엔진
│   │
│   ├── agents/
│   │   ├── base.ts                  # AgentRunner 추상 클래스
│   │   ├── planner.ts
│   │   ├── architect.ts
│   │   ├── backend.ts
│   │   ├── frontend.ts
│   │   └── qa.ts
│   │
│   ├── queue/
│   │   ├── client.ts                # BullMQ Queue 인스턴스
│   │   ├── worker.ts                # BullMQ Worker (별도 프로세스 가능)
│   │   └── jobs/
│   │       ├── run-agent.ts         # agent run 실행 job
│   │       └── send-notification.ts
│   │
│   ├── integrations/
│   │   ├── github.ts                # Octokit wrapper
│   │   └── slack.ts                 # Slack WebClient wrapper
│   │
│   └── auth.ts                      # NextAuth config
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── components/
│   ├── ui/                          # Button, Input, Badge, Card, Dialog 등 공통
│   ├── layout/                      # Sidebar, Header, PageHeader
│   ├── projects/
│   ├── issues/
│   ├── agents/
│   ├── runs/
│   └── approvals/
│
├── hooks/
│   ├── use-projects.ts
│   ├── use-issues.ts
│   ├── use-run-stream.ts            # SSE 실시간 스트림 hook
│   └── use-approvals.ts
│
├── stores/
│   └── ui-store.ts                  # Zustand (sidebar, modal 등 UI state)
│
├── types/
│   ├── api.ts                       # API 응답/요청 타입
│   ├── domain.ts                    # Project, Issue, AgentRun 등 도메인 타입
│   └── mcp.ts                       # MCP tool 입출력 타입
│
├── docker-compose.yml
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. 데이터 모델

### 4.1 Prisma 스키마

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────────────
// 사용자 및 인증
// ──────────────────────────────────────────────
model User {
  id            String         @id @default(cuid())
  name          String?
  email         String         @unique
  emailVerified DateTime?
  image         String?
  role          String         @default("developer")   // owner | admin | developer | viewer
  accounts      Account[]
  sessions      Session[]
  projects      Project[]      @relation("ProjectOwner")
  approvals     Approval[]     @relation("ApprovalResponder")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ──────────────────────────────────────────────
// 프로젝트
// ──────────────────────────────────────────────
model Project {
  id          String     @id @default(cuid())
  name        String
  description String?    @db.Text
  status      String     @default("draft")   // draft | active | at_risk | released | archived
  ownerId     String
  repoUrl     String?
  repoOwner   String?
  repoName    String?
  owner       User       @relation("ProjectOwner", fields: [ownerId], references: [id])
  issues      Issue[]
  documents   Document[]
  runs        AgentRun[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// ──────────────────────────────────────────────
// 이슈
// ──────────────────────────────────────────────
model Issue {
  id          String     @id @default(cuid())
  projectId   String
  parentId    String?    // Epic → Issue 계층
  title       String
  body        String?    @db.Text
  type        String     @default("task")   // epic | story | task | bug
  status      String     @default("backlog") // backlog | ready | in_progress | in_review | qa | done
  priority    String     @default("medium")  // critical | high | medium | low
  assigneeRole String?   // planner | architect | backend | frontend | qa
  labels      String[]
  project     Project    @relation(fields: [projectId], references: [id])
  parent      Issue?     @relation("IssueHierarchy", fields: [parentId], references: [id])
  children    Issue[]    @relation("IssueHierarchy")
  runs        AgentRun[]
  approvals   Approval[]
  prLinks     PRLink[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// ──────────────────────────────────────────────
// 문서 (PRD, ADR, Spec, Runbook 등)
// ──────────────────────────────────────────────
model Document {
  id          String   @id @default(cuid())
  projectId   String
  type        String   // prd | adr | spec | runbook | retro
  title       String
  content     String   @db.Text
  version     Int      @default(1)
  status      String   @default("draft") // draft | in_review | approved | archived
  project     Project  @relation(fields: [projectId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ──────────────────────────────────────────────
// Agent Profile — 역할 정의
// ──────────────────────────────────────────────
model AgentProfile {
  id            String     @id @default(cuid())
  name          String
  role          String     // planner | architect | backend | frontend | qa | release
  systemPrompt  String     @db.Text
  allowedTools  String[]   // 허용 도구 목록
  modelProvider String     @default("anthropic")  // anthropic | openai | google
  modelId       String     @default("claude-sonnet-4-5")
  maxTokens     Int        @default(8192)
  temperature   Float      @default(0.2)
  isActive      Boolean    @default(true)
  runs          AgentRun[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// ──────────────────────────────────────────────
// Agent Run — 실행 단위
// ──────────────────────────────────────────────
model AgentRun {
  id             String       @id @default(cuid())
  projectId      String
  issueId        String?
  agentProfileId String
  status         String       @default("queued")  // queued | running | waiting_approval | succeeded | failed | cancelled
  inputContext   Json?        // agent에 전달된 context 요약
  outputSummary  String?      @db.Text
  outputArtifacts Json?       // 생성된 파일, PR 링크 등
  errorMessage   String?      @db.Text
  startedAt      DateTime?
  completedAt    DateTime?
  project        Project      @relation(fields: [projectId], references: [id])
  issue          Issue?       @relation(fields: [issueId], references: [id])
  agent          AgentProfile @relation(fields: [agentProfileId], references: [id])
  logs           RunLog[]
  approvals      Approval[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ──────────────────────────────────────────────
// Run 로그
// ──────────────────────────────────────────────
model RunLog {
  id        String   @id @default(cuid())
  runId     String
  level     String   @default("info")  // info | warn | error | debug
  message   String   @db.Text
  metadata  Json?
  run       AgentRun @relation(fields: [runId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

// ──────────────────────────────────────────────
// 승인
// ──────────────────────────────────────────────
model Approval {
  id            String    @id @default(cuid())
  issueId       String?
  runId         String?
  type          String    // schema_change | auth_change | billing_change | prod_deploy | spec_approval | general
  status        String    @default("pending")  // pending | approved | rejected | changes_requested
  requestedById String
  respondedById String?
  reason        String?   @db.Text
  diffSummary   String?   @db.Text
  riskScore     Int?      // 0-100
  issue         Issue?    @relation(fields: [issueId], references: [id])
  run           AgentRun? @relation(fields: [runId], references: [id])
  responder     User?     @relation("ApprovalResponder", fields: [respondedById], references: [id])
  respondedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ──────────────────────────────────────────────
// PR 링크 (GitHub PR 추적)
// ──────────────────────────────────────────────
model PRLink {
  id         String   @id @default(cuid())
  issueId    String
  prNumber   Int
  prUrl      String
  repoOwner  String
  repoName   String
  status     String   @default("open")  // open | merged | closed
  issue      Issue    @relation(fields: [issueId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ──────────────────────────────────────────────
// API Token (MCP 연결용)
// ──────────────────────────────────────────────
model ApiToken {
  id          String   @id @default(cuid())
  userId      String
  name        String
  tokenHash   String   @unique  // SHA-256 hash
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
}
```

---

## 5. API 명세

### 5.1 REST API 엔드포인트

모든 API는 JSON 응답을 기본으로 하고, 인증은 NextAuth 세션(쿠키) 또는 Bearer 토큰을 지원한다.[cite:185]

#### Projects

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/projects` | 프로젝트 목록 조회 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/:id` | 프로젝트 상세 |
| PATCH | `/api/projects/:id` | 프로젝트 수정 |
| DELETE | `/api/projects/:id` | 프로젝트 삭제(soft) |
| GET | `/api/projects/:id/issues` | 프로젝트 이슈 목록 |
| GET | `/api/projects/:id/documents` | 프로젝트 문서 목록 |
| GET | `/api/projects/:id/runs` | 프로젝트 run 목록 |

#### Issues

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/issues` | 전체 이슈 목록 (필터: projectId, status, type) |
| POST | `/api/issues` | 이슈 생성 |
| GET | `/api/issues/:id` | 이슈 상세 |
| PATCH | `/api/issues/:id` | 이슈 수정 |
| DELETE | `/api/issues/:id` | 이슈 삭제 |
| POST | `/api/issues/:id/delegate` | agent에 이슈 위임 (run 생성) |

#### Agent Profiles

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/agents` | Agent Profile 목록 |
| POST | `/api/agents` | Agent Profile 생성 |
| GET | `/api/agents/:id` | 상세 |
| PATCH | `/api/agents/:id` | 수정 |
| DELETE | `/api/agents/:id` | 삭제 |

#### Agent Runs

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/runs` | run 목록 (필터: projectId, status) |
| POST | `/api/runs` | run 직접 생성 |
| GET | `/api/runs/:id` | run 상세 + 결과 |
| DELETE | `/api/runs/:id` | run 취소 |
| GET | `/api/runs/:id/logs` | run 로그 조회 |
| GET | `/api/runs/:id/stream` | SSE — 실시간 로그/상태 스트리밍 |

#### Approvals

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/approvals` | 승인 목록 (필터: status) |
| POST | `/api/approvals/:id` | 승인 응답 (approve / reject / changes_requested) |

#### Documents

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/documents` | 문서 목록 (필터: projectId, type) |
| POST | `/api/documents` | 문서 생성 |
| GET | `/api/documents/:id` | 문서 상세 |
| PATCH | `/api/documents/:id` | 문서 수정 (버전 자동 증가) |

#### Webhooks

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/webhooks/github` | GitHub webhook 수신 (PR, push, checks) |
| POST | `/api/webhooks/slack` | Slack action/event 수신 |

### 5.2 공통 응답 형식

```ts
// 성공
{ "data": { ... }, "meta": { "total"?: number } }

// 에러
{ "error": { "code": string, "message": string, "details"?: unknown } }
```

---

## 6. MCP 서버 명세

### 6.1 MCP 엔드포인트

MCP 서버는 Next.js Route Handler로 구현하며, `mcp-handler` 패키지를 사용해 SSE와 Streamable HTTP transport를 동시에 지원한다.[cite:197][cite:199]

- **경로**: `GET/POST /api/mcp` 또는 `GET/POST /api/[transport]`
- **인증**: Bearer 토큰 (ApiToken 테이블 조회)
- **클라이언트 설정**: VS Code, Cursor, Claude Desktop에서 `https://domain.com/api/mcp`로 연결

### 6.2 Tools 목록

| Tool 이름 | 입력 | 출력 | 설명 |
|---|---|---|---|
| `project.list` | `{ status?, limit?, offset? }` | `Project[]` | 프로젝트 목록 조회 |
| `project.get` | `{ id }` | `Project` | 프로젝트 상세 |
| `project.create` | `{ name, description? }` | `Project` | 프로젝트 생성 |
| `issue.list` | `{ projectId, status?, type? }` | `Issue[]` | 이슈 목록 조회 |
| `issue.get` | `{ id }` | `Issue` | 이슈 상세 |
| `issue.create` | `{ projectId, title, body?, type?, priority? }` | `Issue` | 이슈 생성 |
| `issue.delegate` | `{ issueId, agentProfileId }` | `AgentRun` | 이슈를 agent에 위임하고 run 생성 |
| `document.get` | `{ projectId, type }` | `Document` | 최신 문서 조회 |
| `document.create` | `{ projectId, type, title, content }` | `Document` | 문서 생성/버전 업데이트 |
| `run.start` | `{ projectId, issueId?, agentProfileId, context? }` | `AgentRun` | agent run 시작 |
| `run.status` | `{ id }` | `AgentRun` | run 상태 조회 |
| `run.cancel` | `{ id }` | `{ success: boolean }` | run 취소 |
| `approval.request` | `{ issueId?, runId?, type, diffSummary?, riskScore? }` | `Approval` | 승인 요청 생성 |
| `approval.respond` | `{ id, status, reason? }` | `Approval` | 승인 응답 |
| `context.search` | `{ query, projectId?, limit? }` | `SearchResult[]` | 프로젝트 내 키워드 검색 |

### 6.3 Resources 목록

MCP Resources는 read-only context 제공에 사용한다.[cite:186]

| URI 패턴 | 설명 |
|---|---|
| `project://{id}/summary` | 프로젝트 요약 (목표, 상태, milestone) |
| `issue://{id}` | 이슈 상세 (본문, 상태, 연결된 run/PR) |
| `document://prd/{projectId}/latest` | 최신 PRD 전문 |
| `document://adr/{projectId}/latest` | 최신 ADR 전문 |
| `run://{id}/log` | run 실행 로그 전체 |

### 6.4 Prompts 목록

반복 사용되는 워크플로 템플릿을 Prompt로 제공한다.

| Prompt 이름 | 인수 | 설명 |
|---|---|---|
| `decompose-epic` | `{ epicId }` | Epic을 FE/BE/QA Issue로 분해 요청 |
| `generate-prd` | `{ projectId, goal }` | PRD 초안 생성 요청 |
| `triage-issue` | `{ issueId }` | 이슈 triage 및 우선순위 제안 |
| `prepare-release` | `{ projectId }` | 릴리즈 체크리스트 생성 요청 |

---

## 7. 핵심 기능 요구사항

### 7.1 인증 및 권한

- NextAuth.js v5 기반 이메일/GitHub OAuth 로그인[cite:202]
- 세션 쿠키 기반 웹 UI 접근
- ApiToken 기반 MCP 클라이언트 접근
- 역할: `owner`, `admin`, `developer`, `viewer`
- 미인증 요청은 `401` 응답, 권한 없는 요청은 `403` 응답

### 7.2 Agent Run 실행

- Run은 BullMQ 큐에 enqueue되고 worker가 비동기로 처리한다.
- Worker는 AgentProfile의 systemPrompt, allowedTools, modelId를 읽어 LLM API를 호출한다.
- LLM 응답은 RunLog에 실시간 기록되고 SSE `/api/runs/:id/stream`으로 클라이언트에 전달된다.
- 실행 중 승인이 필요한 작업이 발생하면 run 상태를 `waiting_approval`로 변경하고 Approval 레코드를 생성한다.
- 승인 완료 시 run이 재개된다.

### 7.3 승인 게이트

- 다음 작업 유형은 반드시 Approval을 통과해야 한다:
  - `schema_change`: DB 스키마 변경 포함 run
  - `auth_change`: 인증/권한 관련 변경
  - `billing_change`: 결제 관련 변경
  - `prod_deploy`: 프로덕션 배포 관련 작업
- Approval 없이 위 유형의 작업을 진행 시 run이 자동으로 `waiting_approval` 상태로 전환된다.
- 승인자는 diffSummary, riskScore, run 로그를 보고 approve/reject/changes_requested를 선택한다.

### 7.4 실시간 스트리밍

- Run 상태 변경과 로그 추가는 SSE로 실시간 전달된다.
- 클라이언트는 `useRunStream` 훅으로 구독하고, run 완료 또는 실패 시 자동 구독 해제된다.
- MCP SSE transport도 같은 Next.js SSE 인프라를 재사용한다.[cite:197]

### 7.5 GitHub 연동

- 프로젝트에 GitHub 저장소를 연결한다 (`repoOwner`, `repoName`).
- Webhook을 통해 PR 생성/머지/닫힘 이벤트를 수신한다.
- PR 이벤트 수신 시 연결된 이슈의 PRLink 레코드를 자동으로 생성/갱신한다.
- run의 outputArtifacts에 PR URL을 기록한다.

### 7.6 Slack 알림

- 다음 이벤트에 Slack DM 또는 채널 메시지를 발송한다:
  - run 완료/실패
  - 승인 요청 생성
  - 승인 응답 완료
  - 이슈 상태 변경
- Slash command 또는 Slack action으로 승인 응답 가능하도록 webhook 연동 포함

---

## 8. 화면 요구사항

### 8.1 화면 목록

| 화면 | 경로 | 설명 |
|---|---|---|
| 로그인 | `/login` | 이메일/GitHub OAuth |
| 대시보드 홈 | `/` | 전체 요약: 진행 중 프로젝트, 승인 대기, 최근 run |
| 프로젝트 목록 | `/projects` | 프로젝트 카드 목록, 상태 필터 |
| 프로젝트 상세 | `/projects/:id` | 목표, 이슈 요약, 문서 목록, run 목록 |
| 이슈 목록 | `/projects/:id/issues` | 칸반 보드, 상태/타입 필터, agent 위임 액션 |
| 문서 목록 | `/projects/:id/documents` | PRD/ADR/Spec 목록, 마크다운 에디터 |
| Agent 관리 | `/agents` | Agent Profile 목록, 시스템 프롬프트 편집 |
| Run 목록 | `/runs` | 전체 run, 상태 필터 |
| Run 상세 | `/runs/:id` | run 상태, 실시간 로그, 산출물, 승인 요청 |
| 승인 센터 | `/approvals` | 승인 대기 목록, diff 보기, approve/reject |

### 8.2 주요 UI 컴포넌트

- **ProjectCard**: 이름, 상태 badge, 진행률, 최근 run
- **IssueBoard**: 상태별 칸반, drag-drop (추후), agent 위임 버튼
- **RunConsole**: 실시간 로그 뷰어 (SSE), 상태 표시, 취소 버튼
- **ApprovalCard**: diffSummary, riskScore, 승인/반려 버튼
- **AgentProfileEditor**: systemPrompt 텍스트 영역, model 선택, tool 체크리스트
- **DocumentEditor**: 마크다운 에디터, AI 초안 생성 버튼, 버전 표시

---

## 9. 비기능 요구사항

### 9.1 성능

- 대시보드 초기 로드 LCP 3초 이내
- API 응답 95th percentile 500ms 이내
- SSE 스트림 지연 2초 이내
- BullMQ worker는 run당 최대 10분 실행 제한 (모델별 별도 조정 가능)

### 9.2 보안

- 모든 API endpoint는 인증 필수
- Agent의 LLM API 키는 서버 환경변수에만 저장, 클라이언트에 노출 금지
- ApiToken은 SHA-256 해시로 저장
- GitHub Webhook은 secret 검증 필수
- Slack Webhook은 signing secret 검증 필수
- MCP 요청은 Bearer 토큰 검증 필수

### 9.3 확장성

- BullMQ worker는 독립 프로세스로 분리 가능 (동일 코드베이스 유지)
- 추후 Temporal 마이그레이션 고려해 workflow 로직은 `lib/orchestrator/`에 격리
- MCP tool 목록은 `lib/mcp/tools/`에 파일 분리로 확장 가능

### 9.4 로컬 개발

- `docker-compose.yml`에 PostgreSQL, Redis 포함
- `pnpm dev`: Next.js 개발 서버
- `pnpm worker`: BullMQ worker 별도 실행 (`npx tsx lib/queue/worker.ts`)
- `pnpm db:migrate`: Prisma migrate
- `pnpm db:seed`: 테스트 데이터 삽입

---

## 10. 환경 변수

```env
# DB
DATABASE_URL=postgresql://user:pass@localhost:5432/orchestrator

# Redis
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# GitHub OAuth
GITHUB_ID=
GITHUB_SECRET=

# GitHub App (webhook + API)
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_CHANNEL_ID=

# LLM
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# MCP
MCP_AUTH_SECRET=          # API 토큰 생성용 secret
```

---

## 11. 수용 기준

### 11.1 API

- 모든 REST API 엔드포인트가 Zod 스키마 검증을 통과한다.
- 인증 없는 요청은 401을 반환한다.
- 존재하지 않는 리소스 요청은 404를 반환한다.

### 11.2 MCP

- VS Code 또는 Cursor에서 MCP 서버를 연결하고 `project.list` tool을 성공적으로 호출할 수 있다.[cite:197]
- `run.start` tool이 BullMQ 큐에 job을 enqueue하고 run ID를 반환한다.
- `approval.request` tool이 Approval 레코드를 생성한다.

### 11.3 Run 실행

- 이슈를 agent에 위임하면 run이 생성되고 queue에 들어간다.
- Worker가 run을 처리하는 동안 로그가 RunLog에 기록된다.
- SSE 스트림으로 클라이언트가 실시간으로 로그를 수신한다.
- Run 완료 시 Slack 알림이 발송된다.

### 11.4 UI

- 로그인 후 대시보드 접근이 가능하다.
- 프로젝트 생성, 이슈 생성, agent profile 생성이 UI에서 동작한다.
- Run 상세 화면에서 실시간 로그가 표시된다.
- 승인 센터에서 approve/reject 액션이 동작한다.

---

## 12. 개발 순서

구현은 아래 단계로 진행한다.

1. **기반 설정**: Next.js 15 + TypeScript + Tailwind + Prisma 초기화, Docker Compose 환경 구성
2. **DB 스키마**: Prisma schema.prisma 작성 및 초기 migration
3. **인증**: NextAuth v5 설정 (이메일/GitHub OAuth), 세션 보호 미들웨어
4. **Core API**: `/api/projects`, `/api/issues`, `/api/agents`, `/api/runs`, `/api/approvals`, `/api/documents`
5. **MCP 서버**: `app/api/[transport]/route.ts` + 기본 tool 5–6개 구현 및 로컬 MCP 클라이언트 연결 검증[cite:197][cite:199]
6. **BullMQ Worker**: `lib/queue/worker.ts` + `run-agent.ts` job + AgentRunner 기반 LLM 호출
7. **SSE 스트림**: `/api/runs/:id/stream` + `useRunStream` 훅
8. **GitHub 연동**: Webhook 수신, PRLink 연동
9. **Slack 연동**: 알림 발송, action 수신
10. **대시보드 UI**: 프로젝트/이슈/run/승인 화면 순서로 구성
11. **MCP 툴 확장**: resources, prompts 추가
12. **통합 테스트 및 수용 기준 검증**
