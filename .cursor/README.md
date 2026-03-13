# Vernify 项目配置

本目录包含 Cursor IDE 的项目级别配置。

## 分层与引用关系

```
Rule（原则）→ Skill（流程）→ SubAgent（执行）→ Command（触发）
```

- **Rule**：定义原则与约定（如 agent-orchestration、task-priority-workflow）
- **Skill**：提供流程与领域知识，与 Rule 对应时合并表述；**原子化**：每个完成一小任务或流程，可被多 SubAgent、Command 组合
- **SubAgent**：执行具体操作，分工表与 agent-orchestration 完全一致
- **Command**：**原子化**：每个触发一个明确动作，可委托对应 SubAgent 或组合多个 Skill

## 创建与组合约定

- **创建前必查**：新建 Rule/Skill/SubAgent/Command 前，必须查询是否已有类似或可复用配置；若有则复用或扩展，若无再建
- **原子化**：Skills、Commands 尽量原子化，细粒度可组合，避免大而全单体
- **可组合**：Skills、Commands 与 Rules、SubAgents 应可组合使用，避免重复造轮子

## 架构约定

- **主后端**：Next.js（前端 + BFF，`app/api/*`），处理所有 `/api/v1/*` 请求
- **扩展服务**：FastAPI（`Web/backend/`）仅为 Next 提供 AI、LaTeX 等能力，不对外暴露
- 详见 `docs/architecture/ARCHITECTURE.md`、`rules/project-structure.mdc`

## 目录结构

```
.cursor/
├── rules/              # 项目规则（17个）
├── skills/             # 项目技能（见 skills/README.md）
├── agents/             # 项目 SubAgents（见 agents/README.md）
├── commands/           # 斜杠命令（11个）
├── MIGRATION.md        # 变更记录
└── README.md           # 本文件
```

## 参考表：从 Graphiti 检索（任务开始必做）

**任务开始时**须委托 **graphiti-memory** SubAgent 检索 Graphiti（group_id: vernify），获取与当前任务相关的配置与程序。以下查阅型信息已写入 Graphiti，按关键词检索即可：

- **Cursor Rules 摘要** — 核心 Rule 名称与说明
- **Cursor Skills 目录** — Skills 分类与来源
- **Cursor SubAgent 分工** — 任务类型 → SubAgent 表
- **Cursor 斜杠命令** — 命令 → SubAgent/流程

完整定义见：`.cursor/rules/`、`.cursor/skills/README.md`、`.cursor/agents/README.md`、`.cursor/commands/`。根目录 **`.cursorrules`** 为摘要与指针；**核心规则**（alwaysApply）：task-priority-workflow、agent-orchestration、project-structure、post-task-workflow 等。开发流程以 `task-priority-workflow.mdc` 与 `docs/CLAUDE-CURSOR-COLLABORATION.md` 为准。

## Rules、Skills、SubAgents、Commands 入口

- **Rules**：`.cursor/rules/`（17 个）
- **Skills**：`.cursor/skills/`，详见 `skills/README.md`；Vercel 技能 `npx skills add vercel-labs/agent-skills -a cursor`，安装在 `.agents/skills/`
- **SubAgents**：`.cursor/agents/`，分工与 `agent-orchestration.mdc` 一致，详见 `agents/README.md`
- **Commands**：`.cursor/commands/`（如 post-task-review、update-docs、page-maker、graphiti-memory、use-claude-code 等），每个对应一 SubAgent 或流程；命令定义在目录下 `.md` 文件中。

### 与外部工具协作

- **Claude Code**：Cursor 可用 **/use-claude-code** 通过 Graphiti 将 git/构建/测试等 CLI 任务委托给 Claude Code；Claude Code 完成后写回 Graphiti，Cursor 可读。分工与协议见 `.agents/skills/claude-code-bridge/SKILL.md`、根目录 `CLAUDE.md`。

## MCP（Model Context Protocol）

MCP 服务器使用**全局配置** `~/.cursor/mcp.json`，所有项目共享。

当前全局配置的 MCP 服务器：
- **Context7** - 框架/库文档查询（**必用**：实现或审查 Next.js、React、Supabase、FastAPI 等 API 时优先查 Context7，再写代码。用法：resolve-library-id → query-docs。详见 `tools-strategy.md`）
- **Playwright** - 浏览器自动化
- **serena** - AI 助手（需使用 `serena start-mcp-server`，见 [Serena 文档](https://oraios.github.io/serena/02-usage/020_running.html)）
- **manim-server** - Manim 动画
- **mcp-obsidian** - Obsidian 集成

## 说明

- **Rules** 和 **Skills** 是项目级别
- **MCP** 使用全局配置（所有项目共享）
- **Superpowers Hooks**：见 `.cursor/docs/superpowers-hooks.md`（Hooks 用于会话启动时自动执行脚本；Vernify 未安装）
