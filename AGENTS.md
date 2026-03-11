# Vernify — AGENTS.md

> **平台无关的主指令文档。**
> Claude Code（`CLAUDE.md`）、Cursor（`.cursor/rules/`）和所有 AI 工具均遵循本文档中的核心原则。
> 参考来源：[everything-claude-code](https://github.com/affaan-m/everything-claude-code) 适配 Vernify 项目。

---

## Graphiti：核心记忆（最高优先级）

**Graphiti 是所有 AI 工具的统一记忆存储**（group_id: `vernify`，endpoint: `http://localhost:19283/mcp/`）。Agent目录、命令列表、技能目录、架构细节、用户偏好均存于此。

- **任务开始**：先执行 `search_nodes` + `search_facts` 检索相关知识，再开始执行
- **任务结束**：`add_episode` 写入任务摘要；整体重构（先删错误再写，不仅追加）
- **Claude Code ↔ Cursor 共享**：双向读写，同一 group_id

---

## 五大核心原则

### 1. Agent-First（委托优先）

复杂任务必须委托给专用 Agent，主 Agent 只负责协调。

- 复杂新功能 → `/orchestrate feature`（7 阶段：Discovery→Exploration→Clarification→Architecture→Implementation→Review→Summary）
- 代码库探索 → 并行启动 2–3 个 **code-explorer** agents
- 架构设计 → 并行启动 2–3 个 **code-architect** agents
- 架构决策 → 委托 **architect**（使用 opus 模型）
- 代码编写/修改后 → 委托 3 个并行 **code-reviewer**（置信度 ≥ 80 才报告）
- 安全敏感代码（认证、输入处理、API）→ 委托 **security-reviewer**
- Bug 修复或新特性 → 委托 **tdd-guide**
- 独立子任务 → 并行执行多个 Agent（`run_in_background: true`）

### 2. Test-Driven（测试驱动）

先写测试，再写实现。

- **覆盖率要求**：普通代码 ≥ 80%；认证、支付、安全、核心业务逻辑 = 100%
- **三阶段**：RED（写失败测试）→ GREEN（最小实现）→ REFACTOR（质量提升）
- **FastAPI**：`poetry run pytest -v`；**Next.js**：`npm test`
- 测试选择器使用 `data-testid` 而非 CSS 类（防脆性）

### 3. Security-First（安全优先）

永远不妥协安全，任何发现 CRITICAL 漏洞立即停止并告警。

- 所有用户输入必须验证（系统边界）
- secrets 只存 env var，禁止硬编码
- SQL 必须用参数化查询
- Token 存 httpOnly cookies，禁止 localStorage
- 路由必须有认证校验
- 修改安全相关代码时主动调用 security-reviewer

### 4. Immutability（不可变性）

始终创建新对象，禁止直接 mutation。

```typescript
// ✅ 正确
const updatedUser = { ...user, name: 'New Name' }
setState(prev => ({ ...prev, count: prev.count + 1 }))

// ❌ 错误
user.name = 'New Name'
setCount(count + 1)  // stale reference 风险
```

### 5. Plan Before Execute（先规划后执行）

涉及 3+ 文件修改、架构变更、模糊需求时，必须先规划再执行。

- 使用 `/plan` 命令委托 planner 生成方案
- 等待用户确认后才开始实施
- 规划者不写代码，仅生成计划

---

## 模型路由

根据任务复杂度选择模型，降低成本同时保证质量：

| 模型 | 适用场景 | 触发条件 |
| ------ | ---------- | ---------- |
| **haiku** | 确定性低风险变更 | 注释、格式化、简单重命名、单行修复 |
| **sonnet** | 默认（实现与重构） | 功能实现、调试、测试、文档 |
| **opus** | 架构、深度分析 | 架构决策、模糊需求、深度 code review |

使用 `/model-route [任务描述]` 获取模型推荐。

---

## Agent 主动编排策略

以下情况**不等用户提示，主动委托**：

| 触发场景 | 委托 Agent | 工具 |
| ---------- | ----------- | ------ |
| 用户要求复杂新功能 | planner → 用户确认 → 执行 | Claude Code: Task(Plan) / Cursor: planner |
| 完成代码变更后 | code-reviewer | 自动调用 |
| 涉及认证/输入/API 端点 | security-reviewer | 主动调用 |
| Bug 修复或新特性 | tdd-guide | 先写测试 |
| 架构层面决策 | architect（opus） | 明确说明 ADR |
| 数据库变更 | database-reviewer | 审查 SQL/迁移 |

---

## 质量门控（Quality Gates）

所有变更交付前必须通过（使用 `/verify` 命令一键执行）：

| 步骤 | 命令 | 失败时 |
| ------ | ------ | -------- |
| 1. Build | `cd Web && npm run build` | 立即停止 |
| 2. 类型检查 | TypeScript 0 errors | 按文件/行号报告 |
| 3. Lint | `cd Web && npm run lint` | 修复后继续 |
| 4. FastAPI 测试 | `cd Web/backend && poetry run pytest -v` | 修复后继续 |
| 5. 调试语句审计 | 检测 `console.log`、`print(` | 移除后继续 |
| 6. Git 变更确认 | 未提交文件列表 | 提示用户 |

**执行模式**：`/verify quick`（1+5）/ `/verify full`（全部）/ `/verify pre-pr`（全部+安全扫描）

---

## 上下文窗口管理

- 最后 **20%** 上下文时，避免大型重构，改用 `/checkpoint` 存档后开新会话
- 长任务每完成一个主要阶段使用 `/checkpoint` 记录
- 低敏感任务（文档、注释、格式化）可容忍更高上下文利用率
- 委托子任务使用 Task 工具，保持主上下文干净

---

## Chrome DevTools 浏览器测试协议

> 适用于 Claude Code（chrome-devtools MCP）和 Cursor（browser-tester SubAgent）。

**禁止直接 navigate 到具体 URL。** 每次使用浏览器测试工具均须：

1. **开启专用浏览器**，不调用 navigate
2. **等待用户导航**到目标页面，**收到用户确认后**再操作
3. **代码修改后验证**：先请用户关闭现有浏览器 → 重新开启 → 等用户确认 → 再验证

---

## Hooks over Prompts 原则

> **LLM 约 20% 情况会忘记系统提示中的指令。**
> 关键检查必须通过 Hook 自动触发，而不只依赖系统提示。

- Claude Code：已安装 **hookify** 插件（项目级），通过 `.local.md` 配置 markdown 规则
  - hookify 提供 PreToolUse / PostToolUse / UserPromptSubmit / Stop 四个生命周期钩子
- Cursor：通过 `.cursor/hooks/` 配置
- 每次代码变更后自动触发 code-reviewer（PostToolUse Hook）
- 每次任务结束自动触发 post-task-reviewer（写入 Graphiti）

---

## 项目特定约定

### 技术栈

- **前端 + BFF**：Next.js 16（`Web/app/`，App Router）
- **扩展服务**：FastAPI（`Web/backend/`，AI/LaTeX）
- **数据库**：Supabase PostgreSQL 15
- **样式**：Tailwind CSS + DaisyUI；字体：LXGW WenKai

### 禁止事项

- 禁止在根目录创建 `app/`、`package.json`
- 禁止修改已应用的 Supabase 迁移文件
- 禁止用本机 `npm run dev` 或 `uvicorn`（必须 Docker）
- 页面/UI 修改通知用户让 Cursor 处理

---

## Skills

项目级 Skills（两工具共享，位于 `.agents/skills/` + `.claude/skills/`）：

| 技能 | 用途 | 触发场景 |
| --- | --- | --- |
| `vercel-react-best-practices` | 58 条 Vercel Next.js/React 性能规则 | 写/审查/重构 React 或 Next.js 代码 |
| `web-design-guidelines` | 100+ 条 UI 可访问性/UX/性能规则 | 审查 UI、检查可访问性 |
| `vercel-composition-patterns` | React 组件组合模式 | 重构 boolean props 膨胀、设计组件 API |
| `ai-sdk` | Vercel AI SDK 指南 | 构建 AI 功能 |
| `graphiti-memory` | Graphiti 操作 | 读写知识图谱 |
| `n8n-workflow` | n8n-mcp 使用 | 建/改/验证 workflow |

更新：`npx skills update`

---

## 参考文档

| 资源 | 路径 |
| ------ | ------ |
| Claude Code 配置 | `CLAUDE.md` |
| Cursor 规则 | `.cursor/rules/` |
| 架构文档 | `docs/architecture/ARCHITECTURE.md` |
| Claude Code ↔ Cursor 协作 | `docs/CLAUDE-CURSOR-COLLABORATION.md` |
| orchestrate feature 7 阶段 | `docs/orchestrate-workflow.md` |
| n8n 协作 | `docs/n8n-mcp-and-claude-code.md` |
| Graphiti 使用约定 | `docs/GRAPHITI-USAGE.md` |

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Vernify** (1613 symbols, 2977 relationships, 94 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/Vernify/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Vernify/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Vernify/clusters` | All functional areas |
| `gitnexus://repo/Vernify/processes` | All execution flows |
| `gitnexus://repo/Vernify/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`
- Generate docs: `npx gitnexus wiki`

<!-- gitnexus:end -->
