# /orchestrate feature — 7 阶段工作流

本文档为 **orchestrate feature** 的权威阶段说明，Claude Code 与 Cursor 共同引用。参考 Anthropic 官方 feature-dev 思路，融合 Vernify 上下文（Graphiti、Docker、Supabase、n8n）。

## 何时用 /orchestrate feature

- **超大规模或跨模块**：影响 Web/app、Web/backend、Supabase、n8n 中多个
- **需求模糊、边界不清**：需要 Discovery + Exploration + Clarification 再设计
- **需要多视角探索与多方案对比**：并行 code-explorer、code-architect 再选型
- **希望严格「先探索→澄清→架构→用户确认→再实现」**：每阶段有明确等待确认节点

轻量、需求清晰、单模块或 1–2 文件级变更，优先用 **`/plan`**（planner 出方案 → 用户确认 → 执行）。参见「[可执行清单](#与可执行清单的关系)」中的选用标准。

---

## 7 阶段总览

| Phase | 名称 | 目标 | 等待确认 |
|-------|------|------|----------|
| 1 | Discovery | 需求发现、Graphiti 检索、理解确认 | 与用户确认理解 |
| 2 | Codebase Exploration | 并行 code-explorer，读关键文件，呈现摘要 | 无（自动进入 3）|
| 3 | Clarifying Questions | 梳理未明确点（边界、错误处理、DB/n8n 等）| **必须**等用户回答 |
| 4 | Architecture Design | 并行 code-architect，多方案对比与推荐 | **必须**等用户选择 |
| 5 | Implementation | 按选定方案实现 | **必须**等用户批准后才编码 |
| 6 | Quality Review | 并行 3×code-reviewer，置信度过滤，呈现清单 | 询问用户处理方式 |
| 7 | Summary | 总结、写 Graphiti、更新 ARCHITECTURE.md | 无 |

---

## Phase 1：Discovery（需求发现）

**目标**：理解要构建什么。

1. 若需求不清晰，询问用户：要解决的问题、约束、影响的模块（Next.js / FastAPI / Supabase / n8n）。
2. 检索 Graphiti：`search_nodes` / `search_facts` 与需求关键词，`group_id: vernify`。
3. 总结理解并与用户确认。

---

## Phase 2：Codebase Exploration（代码库探索）

**目标**：从代码层面理解相关上下文。

1. **并行**启动 2–3 个 **code-explorer** SubAgent，各关注不同视角（例如：相似实现与执行路径、模块架构与调用链、UI 与测试方式）。
2. 读取各 agent 返回的**关键文件清单**（建议 5–10 个），必要时读文件内容。
3. 呈现探索摘要（架构、模式、关键文件列表）。

---

## Phase 3：Clarifying Questions（澄清问题）

**目标**：消除模糊点后再进入设计。

**⚠️ 此阶段不可跳过。**

1. 基于探索结果与需求，梳理未明确项：边界情况、错误处理、Supabase schema 变更、新 FastAPI 路由、n8n workflow 触发等。
2. 以清单形式呈现问题。
3. **等待用户回答**后方可进入 Phase 4。

---

## Phase 4：Architecture Design（架构设计）

**目标**：多种实现方案对比，选出最优。

1. **并行**启动 2–3 个 **code-architect** SubAgent，不同侧重：最小变更 / 清洁架构 / 实用平衡。
2. 汇总方案，给出推荐（结合 Vernify 架构约定：`docs/architecture/ARCHITECTURE.md`、`project-structure.mdc`）。
3. **向用户呈现对比与推荐，等待用户选择**。

---

## Phase 5：Implementation（实现）

**目标**：按选定方案构建功能。

**⚠️ 必须等待用户明确批准后才开始编码。**

- 页面/UI 修改由 Cursor 直接处理（不需委托）。
- 复杂后端逻辑、git、构建等可通过 **`/use-claude-code`** 委托 Claude Code。

---

## Phase 6：Quality Review（质量审查）

**目标**：多角度审查，只报告高置信度问题。

1. **并行**启动 3 个 **code-reviewer** SubAgent（可分配不同侧重：简洁性 / Bug / 规范）。
2. 汇总结果，**置信度 &lt; 80% 的过滤掉**。
3. 向用户呈现清单，询问处理方式。

---

## Phase 7：Summary（总结 + 记忆）

**目标**：收尾与知识沉淀。

1. 总结构建内容、关键决策、修改文件列表。
2. 写入 Graphiti（`add_episode` / `add_memory`，`group_id: vernify`）。
3. 若有架构变更，更新 `docs/architecture/ARCHITECTURE.md`。

---

## 交接文档格式

每个 SubAgent 完成后建议输出：

```markdown
## Handoff: [当前阶段] → [下一阶段]
**Context**: 任务背景
**Findings**: 发现/决策
**Files Modified**: 修改文件（若有）
**Status**: SHIP / NEEDS WORK / BLOCKED
```

---

## 其他工作流（简要）

| 工作流 | 链路 |
|--------|------|
| **bugfix** | Discovery → code-explorer → 实现 → 3×code-reviewer → /verify |
| **refactor** | architect → 用户确认 → code-reviewer → tdd-executor → /verify |
| **security** | security-reviewer → code-reviewer → 报告 |
| **code-review** | 3×code-reviewer 并行 → 置信度过滤 → 汇总 |

---

## 与可执行清单的关系

- **用 /orchestrate feature**：超大规模、跨模块、需求模糊、需多视角探索与多方案选型时。
- **用 /plan**：需求相对清晰、单模块或轻量变更、快速「方案 → 确认 → 实现」时。

详见 `.cursor/rules/development-workflow.mdc` 中的可执行清单。

---

## 参考

| 资源 | 路径 |
|------|------|
| Cursor 命令 | `.cursor/commands/orchestrate.md` |
| Claude Code 命令 | `.claude/commands/orchestrate.md` |
| 开发工作流与可执行清单 | `.cursor/rules/development-workflow.mdc` |
| 架构文档 | `docs/architecture/ARCHITECTURE.md` |
| 协作架构 | `docs/CLAUDE-CURSOR-COLLABORATION.md` |
