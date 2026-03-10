# Claude Code × Cursor 协作架构

本文档为 **docs/** 下关于 Claude Code 与 Cursor 协作的权威说明。两工具通过 Graphiti 与 docs/ 共享上下文，分工明确、委托可追溯。

> **核心原则**：详见根目录 [`AGENTS.md`](../AGENTS.md)（平台无关主文档，两工具共同遵循）。

## 协作架构概览

```
AGENTS.md（平台无关主文档：5大原则、质量门控、Agent编排策略）
       │
       ├── Claude Code (.claude/)  ←→  Graphiti (group_id: vernify)  ←→  Cursor (.cursor/)
       │                                       │
       └── docs/（单一文档根，两工具共同维护）──────┘
```

| 共享层 | 说明 |
|--------|------|
| **AGENTS.md** | 平台无关主文档：5大原则、质量门控、Agent 编排策略，两工具共同遵循 |
| **Graphiti** | `group_id: vernify`，双向读写；Cursor 与 Claude Code 写入的记忆彼此可读 |
| **docs/** | 唯一文档根，架构、迁移、规范等均在此；两工具共同维护 |
| **Skills** | `.agents/skills/` 为共享技能库：Claude Code 经 `.agent/skills/`、Cursor 经 `.cursor/skills/` 访问 |

## 关键文件

| 文件 | 用途 |
|------|------|
| **AGENTS.md** | 平台无关主文档（5大原则、模型路由、质量门控）|
| **CLAUDE.md** | Claude Code 项目入口，引用 AGENTS.md |
| **.claude/commands/** | Claude Code 斜杠命令（/verify /plan /tdd /orchestrate /checkpoint /model-route）|
| **.claude/agents/** | Claude Code Agent 模板（architect/planner/code-explorer/code-architect/code-reviewer/security-reviewer 等） |
| **.cursor/rules/development-workflow.mdc** | Cursor 开发工作流规范（引用 AGENTS.md）+ **可执行清单**（何时 /verify、/plan、/checkpoint、委托谁）|
| **.cursor/commands/** | Cursor 命令（/verify /plan /orchestrate /checkpoint 等）；/verify 与 AGENTS.md 六步门控一致 |
| **.agents/skills/claude-code-bridge/SKILL.md** | 协作桥梁技能 |
| **.cursor/commands/use-claude-code.md** | Cursor → Claude Code 委托命令 |

## 分工原则

| 任务类型 | 主要工具 |
|----------|----------|
| Git、构建/测试、复杂 bash、文件整理、长时自动化 | **Claude Code** |
| 代码编辑、UI/页面制作、Serena 代码分析、浏览器测试 | **Cursor** |
| Graphiti 记忆、Supabase 查询 | **两者均可**（MCP 共享）|
| n8n workflow 创建/管理 | **两者均可**（共享 n8n-mcp + n8n-skills）|

## 委托与回写

- **Cursor → Claude Code**：在 Cursor 中运行 **`/use-claude-code`**（可附带任务描述）；将任务上下文写入 Graphiti（如 `add_episode`），用户切换到 Claude Code 后，其按 CLAUDE.md 在任务开始时检索 Graphiti 并执行。
- **Claude Code → Cursor**：Claude Code 完成后将结果/摘要写回 Graphiti；Cursor 可通过 graphiti-memory 检索「最近的 Claude Code 任务结果」继续后续工作。

## Chrome DevTools 浏览器测试协议

使用 Chrome DevTools MCP（Cursor：browser-tester；Claude Code：chrome-devtools MCP）时**必须**遵守：

1. **不直接 navigate**：先开启专用浏览器，**不**调用 navigate 到具体 URL。
2. **等用户导航并确认**：告知用户「专用浏览器已启动，请导航到目标页面后告诉我」，收到确认后再进行截图/控制台/网络等操作。
3. **改代码后验证**：先请用户关闭现有专用浏览器 → 再重新开启 → 等用户导航并确认 → 再验证结果。

详见 `AGENTS.md`（Chrome DevTools 浏览器测试协议）、`.cursor/rules/browser-debug.mdc`、`.cursor/agents/browser-tester.md`。

## Claude Code 插件（claude-plugins-official）

已安装的项目级插件（重启后生效）：

| 插件 | 功能 |
| --- | --- |
| **hookify** | 行为守卫钩子，通过 `.local.md` 配置规则，提供 PreToolUse/PostToolUse/UserPromptSubmit/Stop 四个生命周期 |
| **commit-commands** | `/commit`、`/commit-push-pr`、`/clean_gone` 三个 git 工作流命令 |

新增 Agent（Claude Code + Cursor 各一套）：

| Agent | 用途 | 调用时机 |
| --- | --- | --- |
| **code-explorer** | 代码库探索，追踪执行路径 | `/orchestrate feature` Phase 2，并行 2–3 个 |
| **code-architect** | 架构蓝图设计 | `/orchestrate feature` Phase 4，并行 2–3 个 |

插件安装：`/plugin install {name}@claude-plugin-directory` 或 `/plugin > Discover`。参考 [claude-plugins-official](https://github.com/anthropics/claude-plugins-official)。

`/orchestrate feature` 已升级为 **7 阶段工作流**：Discovery → Exploration → Clarification → Architecture → Implementation → Review → Summary，每阶段有明确等待确认节点。**阶段详解**见 [docs/orchestrate-workflow.md](orchestrate-workflow.md)（两工具统一引用）。

## Vercel Agent Skills（共享技能库）

通过 [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) + [vercel-labs/skills CLI](https://github.com/vercel-labs/skills) 安装，两工具共享：

| 技能 | 路径 | 用途 |
| --- | --- | --- |
| `vercel-react-best-practices` | `.claude/skills/` + `.agents/skills/` | 58 条 Next.js/React 性能规则 |
| `web-design-guidelines` | `.claude/skills/` + `.agents/skills/` | 100+ 条 UI 可访问性/UX/性能规则 |
| `vercel-composition-patterns` | `.claude/skills/` + `.agents/skills/` | React 组件组合模式（含 React 19） |

**Claude Code** 从 `.claude/skills/` 读取（`skillsDir`）；**Cursor** 从 `.agents/skills/` 读取（vercel-labs/skills 的 `cursor` agent 使用该路径）。

更新命令：`npx skills update`

**Cursor 侧**：Graphiti 写入 API 以 `docs/GRAPHITI-MCP-REFERENCE.md` 为准（add_memory 必填 name + episode_body；MCP 服务器名 user-graphiti；URL 无尾斜杠）。检索关键词含 Cursor SubAgent 分工、Cursor 斜杠命令、Cursor Rules 摘要、Cursor Skills 目录，见 `docs/GRAPHITI-USAGE.md`。

---

## n8n 工作流与 n8n-mcp

- Cursor 使用社区版 **n8n-mcp**（czlonkowski/n8n-mcp）创建/管理 workflow；建 workflow 时委托 **n8n-workflow** SubAgent。
- Claude Code 可安装 **n8n-skills**（`/plugin install czlonkowski/n8n-skills`）与 n8n-mcp 配合使用。
- 配置与协作细节见 **[n8n-mcp 与 Claude Code 协作](n8n-mcp-and-claude-code.md)**。

## 参考

- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) — Vercel React/Web/组合模式技能（vercel-react-best-practices、web-design-guidelines、vercel-composition-patterns）
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — npx skills CLI，安装共享技能到 .agents/skills/
- [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — 官方 Claude Code 插件目录（hookify、commit-commands 等）
- [CLAUDE.md](../CLAUDE.md) — Claude Code 项目配置与协议
- [.agents/skills/claude-code-bridge/SKILL.md](../.agents/skills/claude-code-bridge/SKILL.md) — 协作桥梁技能
- [.cursor/rules/project-structure.mdc](../.cursor/rules/project-structure.mdc) — 项目结构、目录约定、技术栈
- [GRAPHITI-USAGE.md](GRAPHITI-USAGE.md) — Graphiti 使用约定
- [n8n-mcp-and-claude-code.md](n8n-mcp-and-claude-code.md) — n8n-mcp 配置与 n8n-skills、Cursor/Claude Code 分工
