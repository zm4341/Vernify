# Vernify — Claude Code 项目配置

> 核心原则见 [`AGENTS.md`](AGENTS.md)。**Graphiti 是核心记忆**（group_id: `vernify`，`http://localhost:19283/mcp/`）——Agent 目录、命令列表、技能目录、架构细节均存于此，任务开始时按需检索。

---

## 必做协议（最高优先级，不得跳过）

### 任务开始：先检索 Graphiti + GitNexus

**在做任何事之前**，按序执行：

1. **Graphiti 检索**（任务上下文/历史决策）：
```
search_nodes(query="<任务关键词>", group_ids=["vernify"])
search_facts(query="<任务关键词>", group_ids=["vernify"])
```

2. **GitNexus 索引检查**（代码类任务必做）：
```
gitnexus_detect_changes()   → stale 时先运行 terminal: npx gitnexus analyze
gitnexus_query(query="<任务关键词>")  → 理解相关代码结构
```

3. 若上下文仍不足，再读 `docs/architecture/ARCHITECTURE.md` 或 `.cursor/rules/`

### 改代码前：impact 分析

修改任何函数/类/方法前，必须先查影响范围：
```
gitnexus_impact(target="<symbolName>", direction="upstream")
```
- 结果为 HIGH/CRITICAL → 先告知用户再动手

### 任务结束：写入 Graphiti

完成有实际变更或得出结论的任务后，必须：

1. `add_episode` 记录任务摘要（做了什么、关键结论）
2. 必要时更新 `docs/`：架构变更 → `docs/architecture/ARCHITECTURE.md`
3. **整体重构**：写入前检索既有记忆，发现错误先删再写，不仅追加

---

## Graphiti 配置

- **endpoint**：`http://localhost:19283/mcp/`
- **group_id**：`vernify`

---

## 关键规则

### 目录

- `Web/` 为应用根；所有命令在 `Web/` 下执行
- `docs/` 为唯一文档根；根目录无 `app/`、`package.json`

### 运行方式

- **所有服务在 Docker 中运行**，禁止混用本机 `npm run dev` 或 `uvicorn`
- 开发启动：`cd Web && docker compose -f docker-compose.yml -f docker-compose.dev.yml -p vernify up -d`
- 访问入口：`http://127.0.0.1:38080/`

### MCP 服务

- **Graphiti**：`http://localhost:19283/mcp/`
- **Supabase**：`http://localhost:18492/mcp`

---

## 技术栈快速参考

- **前端 + BFF**：Next.js 16 + React 19（`Web/app/`，App Router）
- **扩展服务**：FastAPI（`Web/backend/`，AI/LaTeX，不对外暴露）
- **数据库**：Supabase PostgreSQL 15
- **样式**：Tailwind CSS + DaisyUI；字体：LXGW WenKai

---

## 禁止事项

- 不在根目录创建前端文件或 `package.json`
- 不修改已应用的 Supabase 迁移文件（`Web/supabase/migrations/`）
- 不用本机 `npm run dev` 或 `uvicorn` 启动服务
- Graphiti group_id 统一用 `vernify`，不用其他标识符
- 页面/UI 修改（`Web/app/`、`Web/components/`）须通知用户让 Cursor 处理

---

## 配置位置

- **Agent 模板**：`.claude/agents/`（Graphiti 检索 "Claude Code Agent 目录" 获取详情）
- **命令**：`.claude/commands/`（Graphiti 检索 "斜杠命令" 获取详情）
- **Skills**：`.claude/skills/` + `.agents/skills/`（Graphiti 检索 "Skills 目录" 获取详情）
- **完整 Cursor 规则**：`.cursor/rules/`
- **架构文档**：`docs/architecture/ARCHITECTURE.md`

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
