# Vernify — Claude Code 项目配置

> 核心原则见 [`AGENTS.md`](AGENTS.md)。**Graphiti 是核心记忆**（group_id: `vernify`，`http://localhost:19283/mcp/`）——Agent 目录、命令列表、技能目录、架构细节均存于此，任务开始时按需检索。

---

## 必做协议（最高优先级，不得跳过）

### 任务开始：先检索 Graphiti

**在做任何事之前**，先用 `graphiti` MCP 检索相关知识：

```
search_nodes(query="<任务关键词>", group_ids=["vernify"])
search_facts(query="<任务关键词>", group_ids=["vernify"])
```

- 若上下文不足，再读 `docs/architecture/ARCHITECTURE.md` 或 `.cursor/rules/`

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
