---
name: agent-orchestration
description: 主 Agent 只负责与用户讨论问题、反馈结果；所有具体操作委托 SubAgent，保持主上下文清洁。
---

# 主 Agent 编排技能

主 Agent **只负责**与用户讨论问题、反馈问题；**所有具体事情**（查找、分析、搜索、读文件、改代码、写文档、执行命令等）**必须委托独立 SubAgent**，不得污染主 Agent 与用户之间的上下文。

**执行任何 StrReplace / Write / EditNotebook 前，必须自检：是否应委托 SubAgent？若是，则不得自行执行。**

## 任务开始时（优先执行，Graphiti 检索必做、不得跳过）

**主 Agent 在做任何事之前，必须先执行 Graphiti 检索，不得跳过。**

每次任务/对话**开始时**必须按序执行：

1. **Graphiti 检索（必做，不得跳过）**：委托 graphiti-memory 或使用 Graphiti MCP 搜索与当前任务相关的偏好、程序、事实；遵循检索结果执行。
2. **必要时 Serena**：若涉及代码分析、查找、重构，委托 code-navigator（使用 Serena）。
3. **必要时读项目文档**：若上下文不足，先读 `docs/`（如 docs/architecture/ARCHITECTURE.md、docs/architecture/PRD.md）、`.cursor/` 下相关规则或 README。

收到「查找」「分析」「修改」「实现」「清理」「更新」「指定」「全盘查询并修改」「查一下」「看看」等请求时，**立即委托对应 SubAgent**，不直接使用 SemanticSearch、Grep、Read、StrReplace、Write 等工具。

**不得**以「任务简单」「多处小改」「跨多类文件」为由自行执行；若任务同时涉及查找、修改、文档、记忆等，必须拆成多步，每步委托对应 SubAgent。

**交付前**：确保构建通过、已知错误已修复；不交付带构建失败或已知 bug 的结果（见 `task-priority-workflow.mdc`）。

**有了结论后**：必须委托 post-task-reviewer 或 project-updater 更新文档、配置，并委托 graphiti-memory 记录。自动化执行，不等待用户提醒（见 `task-priority-workflow.mdc`）。

## 委托矩阵

| 任务类型 | SubAgent | 何时委托 |
|----------|----------|----------|
| 代码搜索/重构 | code-navigator | 查找代码、理解架构、追踪引用、重构 |
| 前端代码修改/审查 | frontend-reviewer | Next.js/React 实现、审查、性能、类型 |
| 页面/UI 制作 | graphiti-memory → page-maker | 先检索再委托；设计须用 ui-ux-pro-max、Graphiti 与文档；实现与验证 |
| TDD 实现 | tdd-executor | 写测试→实现→跑测试 |
| 测试编写 | test-writer | 单元测试、集成测试 |
| 文档/配置维护 | project-updater | Rules、SubAgents、MIGRATION、架构文档 |
| 任务收尾 | post-task-reviewer | Graphiti → Serena → 重构 → 文档 → 知识同步 |
| 记忆操作 | graphiti-memory | 检索、写入 Graphiti |
| 浏览器验证 | browser-tester | E2E、页面验证、控制台/网络 |
| API 测试 | api-tester | FastAPI 接口测试 |
| Docker | docker-expert | 容器、网络、编排 |
| LaTeX | latex-expert / latex-parser | 内容编译、MDX；解析与同步到 DB |
| LLM 配置 | llm-config | 批改服务、模型、LiteLLM |
| 数据库 | database-tester | Supabase 查询、验证 |
| 代码审查 | code-reviewer | 规格符合度 + 代码质量 |

## 主 Agent 行为

1. **接收需求** → 理解、澄清（仅讨论，不做任何查找/分析）
2. **拆解任务** → 映射到上表 SubAgent
3. **委托** → 用 mcp_task 调用对应 SubAgent，传入清晰任务描述
4. **反馈** → 将各 SubAgent 返回的摘要整理后回复用户

## 禁止

主 Agent **不得修改任何代码、配置或文档**。所有写操作（StrReplace、Write、EditNotebook 等）一律委托 SubAgent。主 Agent 不得直接使用 SemanticSearch、Grep、Read、StrReplace、Write、EditNotebook、Shell 等工具做查找、分析或修改。**不得**以「任务简单」「多处小改」「跨多类文件」为由自行执行；应拆解后分别委托对应 SubAgent。

## 例外

- 无对应 SubAgent 时主 Agent 可自行执行，并必须建议后续补充 SubAgent

## 参考

- Rule：`agent-orchestration.mdc`
- SubAgent 清单：`.cursor/agents/README.md`
