# Vernify Web 模块化方案

在 **ARCHITECTURE.md** 的基础上，按领域拆分、保持向后兼容，以项目为准逐步实施。

---

## 1. 原则

- **以项目为准**：不引入新框架，仅在现有 Next + FastAPI + Supabase 上做目录与职责拆分。
- **向后兼容**：对外保留 `lib/api/client.ts` 的 `api` 与 `apiClient` 导出，现有 `import { api } from '@/lib/api/client'` 不破坏。
- **按领域拆分**：course / lesson / quiz / grading / user / ai / latex 各成小块，便于维护与测试。

---

## 2. 前端模块化步骤

### 阶段 1：API 客户端按领域拆分（推荐先做）


| 步骤  | 内容                                | 说明                                                                   |
| --- | --------------------------------- | -------------------------------------------------------------------- |
| 1.1 | 新增 `lib/api/endpoints/courses.ts` | 只包含 `courses.`* 的端点封装，接受 `client: ApiClient`。                        |
| 1.2 | 新增 `lib/api/endpoints/lessons.ts` | `lessons.*`。                                                         |
| 1.3 | 新增 `lib/api/endpoints/quiz.ts`    | `quiz.*`。                                                            |
| 1.4 | 新增 `lib/api/endpoints/grading.ts` | `grading.*`。                                                         |
| 1.5 | 新增 `lib/api/endpoints/users.ts`   | `users.*`。                                                           |
| 1.6 | 新增 `lib/api/endpoints/ai.ts`      | `ai.*`。                                                              |
| 1.7 | 新增 `lib/api/endpoints/latex.ts`   | `latex.*`。                                                           |
| 1.8 | `lib/api/client.ts`               | 保留 `ApiClient` 类与单例 `apiClient`，从各 endpoint 组装 `api` 对象并导出，保证现有引用不变。 |


完成后：调用方仍用 `api.courses.list()` 等，实现按文件拆分，便于后续加类型、单测或按需加载。

### 阶段 2：lib 子目录按领域分组（已完成）

- **schemas**：拆分为 `lib/schemas/base.ts`、`user.ts`、`course.ts`、`quiz.ts`、`grading.ts`，`lib/schemas/index.ts` 统一 re-export，`@/lib/schemas` 引用不变。
- **hooks**：拆分为 `lib/course/hooks.ts`、`lib/quiz/hooks.ts`、`lib/grading/hooks.ts`，`lib/hooks/useApi.ts` 统一 re-export，`@/lib/hooks/useApi` 引用不变。
- **auth**：`lib/auth/store.ts`、`lib/auth/auth-sync.tsx`，`lib/stores/auth.ts` 与 `lib/stores/auth-sync.tsx` 仅 re-export，`@/lib/stores`、`@/lib/stores/auth-sync` 引用不变。
- **content**：`lib/content/lessons-db.ts`、`lib/content/lessons.ts`（课时内容来自 DB）；`lib/lessons-db.ts` 仅 re-export，`@/lib/lessons-db`、`@/lib/content` 引用。
- **API 请求策略**：单客户端、单 baseURL；所有请求走 Next BFF（`/api/v1/*`），AI/LaTeX 由 Next 内部转发至 FastAPI。Caddy 不访问 FastAPI。见 ARCHITECTURE.md §2.2。

### 阶段 3：类型收紧（已完成）

- **Endpoints**：`courses` / `lessons` / `quiz` / `grading` / `users` 的请求参数与返回值已使用 `@/lib/schemas` 类型（`Course`、`Lesson`、`Question`、`Submission`、`CourseProgress`、`User`、`Grading`、`GradingStats`、`CourseQuestion`、`SubmitAnswerInput`、`BatchSubmitInput`）。`ai` / `latex` 暂无响应 schema，保留 `unknown` 并加注释。
- **Schemas 新增**：`GradingStats`（批改统计）、`CourseQuestion`（课程题目列表项）已加入 `lib/schemas`。
- **Hooks**：course/quiz 的 hooks 已去掉冗余 `as Type` 与 `unknown` 映射，直接使用 API 返回类型 + Zod parse 校验。

---

## 3. 扩展服务（FastAPI）模块化

> FastAPI 非主后端，仅为 Next.js 提供能力扩展。

- **已实施（AI 模块）**：`api/v1/ai.py` 仅做参数校验与 HTTP，所有 AI 业务（批改、对话、流式、Embed、Rerank）在 **services/ai_service.py** 的 `AIService` 中；路由不直接引用 litellm 或 `services/llm.factory`。
- **可选延续**：其他路由可同样约定 **router → service**，业务进 `services/`，避免在 router 内直接写 Supabase/LLM。
- 跨模块依赖通过 `services/` 或 `core/deps.py` 注入，避免 api 层互相引用。

---

## 4. 实施顺序建议

1. **先做阶段 1**：拆分 API 客户端为多个 endpoint 文件 + 单入口 client，合并后跑通现有页面与 API。
2. 再视需要做阶段 2（lib 分组）和阶段 3（类型）。
3. 后端在需要扩展或重构某一块时，再按"router → service"边界收口。

---

## 5. 验收

- 现有所有调用 `api.`* 的页面与 API Routes 行为不变。
- `npm run build` 与关键 E2E/手动流程通过。
- 新代码新需求优先使用拆分后的 endpoint 与类型，逐步减少 `any`。
