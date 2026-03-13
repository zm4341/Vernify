# Vernify Web 代码架构说明

基于 Serena 与代码库分析整理。以项目为准，便于后续模块化与维护。

---

## 运行方式

**Vernify 所有服务均在 Docker 中运行**，不混用本机 `npm run dev` 或 `uvicorn`。前后端、FastAPI 扩展服务、Supabase 等统一在容器内运行，经 Caddy 入口 `http://127.0.0.1:38080` 访问。

开发环境若需课程列表出现示例课程（如「圆的初步认识」），需在数据库就绪后**手动执行** seed。Docker 仅将 `supabase/migrations` 挂载到 db 的 `docker-entrypoint-initdb.d`，**不会自动执行 seed**。在项目根目录执行（需先 `cd Web && docker compose -f docker-compose.yml -f docker-compose.dev.yml -p vernify up -d` 确保 db 已启动）：

```bash
docker exec -i Vernify-db psql -U postgres -d vernify < Web/supabase/seed.sql
```

若课程已存在会报主键冲突，可忽略或先清空相关表再执行。

**开发环境 HMR（热更新）**：Next.js 16 引入 `isolatedDevBuild`（默认启用），使 `next dev` 的输出写到 `.next/dev/`。在 Docker 中这等于写到 `/app/.next/dev/`（volume 挂载），而 Turbopack 同时在监视 `/app/**`，导致写操作被误判为源码变更 → 触发无限重编译循环 → HMR WebSocket ID 持续变化 → 浏览器不断重连 → 视觉重置。修复方式：在 `next.config.mjs` 中设置 `experimental.isolatedDevBuild: false`，使 dev 输出写到 `NEXT_DIST_DIR=/tmp/.next/`（不在被监视的 `/app/` 内），同时 Caddy 已配置 WebSocket 透传（`flush_interval -1`），HMR 可通过 `http://localhost:38080` 正常使用。修改 frontend 配置后需执行 `docker compose up -d --force-recreate frontend` 使生效。

---

## 1. 整体拓扑

```
浏览器
   │
   ▼
Caddy (38080/38443) ─┬─► Next.js (前端 + BFF，主后端)
   │                 │       │
   │                 │       └── 内部直接请求 FastAPI (backend:8000) 获取 AI/LaTeX 能力
   │                 │
   │                 └─► Supabase Kong (/auth, /rest, /storage) ─► GoTrue / PostgREST / Storage
   │
   └─ Caddy 不访问 FastAPI；Next.js 与 FastAPI 为服务间直接通信
```

- **Next.js**：主栈，既是前端也是主后端。SSR、页面、**BFF**（`app/api/*`）；所有 `/api/v1/*` 请求由 Next 处理；需要 AI/LaTeX 时内部直接请求 FastAPI。
- **FastAPI**：仅为 Next.js 提供能力扩展，不对外暴露。Caddy 不代理 FastAPI；Next 通过 `AI_SERVICE_URL`（如 `http://backend:8000`）内部调用。
- **Supabase**：鉴权、业务表、Storage；由 Kong 做网关。

---

## 2. 前端 (Web/)

### 2.1 目录与职责

| 路径 | 职责 |
|------|------|
| `app/` | App Router 页面与 **Next.js API Routes**（BFF） |
| `app/api/v1/*` | 课程、课时、答题、批改、用户、**ai**、**latex**、**admin/stats**；多数组装 Supabase；ai/latex 为 FastAPI 代理（`lib/api/fastapi-proxy.ts`）；admin/stats 按学科·年级聚合统计，返回 `subjects`（去重学科列表），总览卡片为学科数、题目数、用户数 |
| `app/auth`, `app/login`, `app/register` | 登录/注册/回调 |
| `lib/` | 共享逻辑：API 客户端、Schemas、Supabase、Hooks、Stores、课时内容（DB）、课程 DB |
| `components/` | 通用 UI：课程页、课时页、答题、Landing 等 |

### 2.2 请求策略（单客户端、单 baseURL）

- **统一走 Next BFF**：所有请求走 `/api/v1/*`，由 Next.js API Routes 处理。课程、课时、答题、批改、用户等由 BFF + Supabase 完成；AI/LaTeX 由 Next 接收请求后内部转发至 FastAPI（`app/api/v1/ai/[...path]`、`app/api/v1/latex/[...path]` 代理）。
- **Caddy 不访问 FastAPI**：浏览器仅与 Caddy、Next 通信；Next 与 FastAPI 为服务间直接调用（`AI_SERVICE_URL`）。
- **单客户端**：`lib/api/client.ts` 单例 `apiClient`，baseURL 为空（同源）；所有路径为 `/api/v1/*`。
- **鉴权**：Supabase Auth；前端用 `lib/supabase/client` + `lib/stores/auth*` 同步登录态。

### 2.3 当前痛点（与模块化相关）

- `lib/api/client.ts` 单文件集中了 **courses / lessons / quiz / grading / users / latex / ai** 全部端点，体积大、按领域拆分不足。
- `lib/` 已按领域分组（见 MODULARIZATION 阶段 2）；content 为课时内容，来自 DB。
- 类型：部分仍用 `any`（如 `api.courses.list` 返回），与 `lib/schemas` 的 Zod 类型未完全对齐。

---

## 3. 扩展服务 FastAPI (Web/backend/app/)

> FastAPI 不是应用的后端，而是 Next.js 调用的**能力扩展服务**（AI、LaTeX 等）。主后端为 Next.js。

### 3.1 目录与职责

| 路径 | 职责 |
|------|------|
| `api/v1/` | **main.py 仅挂载 ai、latex**；courses, lessons, quiz, grading, users 在 backend 存在但**未挂载**，属遗留/死代码 |
| `core/` | config, security, deps |
| `db/` | Supabase 客户端 |
| `models/` | Pydantic 模型（submission, course, user） |
| `services/` | 业务：grading, **llm**（LiteLLM 适配）, **latex_parser**（LaTeX 解析，从根目录 compiler 迁移） |
| `workers/` | Celery 任务 |
| `extensions/` | 插件基类与加载 |

### 3.2 路由挂载与调用方式

- `main.py` 挂载：**ai_router**、**latex_router**（前缀 `/api/v1/ai`、`/api/v1/latex`）。
- **FastAPI 仅被 Next.js 内部调用**：Next 的 `app/api/v1/ai/[...path]`、`app/api/v1/latex/[...path]` 及 `app/api/chat`、`app/api/v1/quiz/submit` 等，通过 `AI_SERVICE_URL` 直接请求 `backend:8000`，Caddy 不参与。

### 3.3 AI 分层（已实施）

- **api/v1/ai.py**：仅做 HTTP 与参数校验，所有业务委托给 **app.services.ai_service**。
- **app.services.ai_service.AIService**：应用服务层，封装批改、对话、流式、Embedding、Rerank；内部使用 `get_llm_adapter()`、`acompletion`、`aembedding`（LiteLLM）。
- **依赖方向**：`api/v1/ai` → `services/ai_service` → `services/llm`（factory + base）+ LiteLLM；路由不直接引用 litellm 或 factory。

### 3.4 当前状态

- **实际挂载**：main.py 仅挂载 `ai_router`、`latex_router`；课程/课时/答题/批改/用户等由 Next BFF + Supabase 完成，FastAPI 中的对应路由未使用。
- 按资源拆路由已具备模块形状；与 Supabase 的职责划分清晰（读写在 Next BFF + Supabase，AI/LaTeX 在 FastAPI）。
- AI 模块已实现 **router → AIService → LLM** 分层，便于单测与替换实现。
- 可继续加强：其他路由与 services 的边界、跨模块依赖通过显式接口。

---

## 4. 模块边界建议（为模块化做准备）

| 模块 | 前端 (Web) | 扩展服务 (backend) | 说明 |
|------|-------------|-------------------|------|
| **Auth** | lib/supabase/*, lib/stores/auth* | 无（GoTrue） | 鉴权与登录态 |
| **Course** | lib/api（courses）, hooks（useCourse*）, schemas（Course, Lesson） | models/course（api/v1/courses 未挂载） | 课程/课时元数据 |
| **Quiz** | lib/api（quiz）, hooks, schemas（Question, Submission） | models/submission（api/v1/quiz 未挂载） | 答题与提交 |
| **Grading** | lib/api（grading）, hooks | -（全部在 Next BFF + Supabase） | 批改与争议 |
| **User** | lib/api（users）, schemas（User） | models/user（api/v1/users 未挂载） | 用户信息 |
| **Content** | lib/content/lessons, lib/lessons-db | 无 | 课时内容来自 DB |
| **AI / LaTeX** | lib/api（ai, latex） | api/v1/ai → **services/ai_service** → services/llm；api/v1/latex | AI 批改/对话/流式/Embed/Rerank；LaTeX 同步；Admin 单一面板 `/admin/latex-sync`；AdminSidebar 可收缩（72px/224px）、导航标签「LaTeX 同步」，AdminLayoutClient 管理 collapsed 状态、侧边栏默认收起 |

---

## 5. 静态与动态边界

- **不依赖静态 Markdown 文件**：应用不读取、不生成任何课时用 .md 静态文件；课时正文仅来自数据库 `lessons.content_source`，前端用 **MDX (next-mdx-remote)** 渲染，支持 Markdown + JSX 及 FadeIn、LetterByLetter、SlideUp 等动画组件。
- **动态数据**：课程与课时元数据、登录/鉴权、答题与批改等来自 Supabase；AI/LaTeX 由 FastAPI 提供。
- **静态内容**：除上述动态数据外，页面结构、组件、样式、静态资源（图片/视频等）按静态方式处理；无基于 .md 的静态内容管道。

## 6. 文档与后续

- 本文件：**当前**架构与数据流、模块边界建议。
- **技术栈与数据流**：`docs/architecture/TECH-STACK-ANALYSIS.md` 为技术栈 + 数据流唯一源，含版本、Import 模式、模块边界与重构建议。
- 模块化具体步骤与优先级见 **MODULARIZATION.md**（可按需创建）。
- 课时内容渲染与存储变更见 **docs/migration/CONTENT-SOURCE-MIGRATION.md**。
- 变更架构或路由时请同步更新此文档。
- **开发与收尾流程**：任务开始（Graphiti 检索必做 → GitNexus 代码类 → 读文档不足时 → issue+分支 开发/修复/功能类 → SubAgent）、改代码前 impact、任务结束（detect_changes → commit/push → Graphiti 记录 → 更新文档/配置 → PR），以 `task-priority-workflow.mdc` 与 `docs/CLAUDE-CURSOR-COLLABORATION.md` 为准；详见 `.cursor` 规则：`task-priority-workflow.mdc`、`agent-orchestration.mdc`、`post-task-workflow.mdc`。
