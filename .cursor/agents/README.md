# Vernify 项目 SubAgents

项目专用的 AI 子代理，针对特定任务提供专业指导。**任务开始时**可检索 Graphiti（关键词 **Cursor SubAgent 分工**）获取分工摘要；本页保留完整表与 `rules/agent-orchestration.mdc` 一致，便于维护与查阅。主 Agent 执行前须自检是否应委托，复合任务须拆步、每步委托对应 SubAgent。开发流程以 `task-priority-workflow.mdc` 与 `docs/CLAUDE-CURSOR-COLLABORATION.md` 为准。

## 编排原则（agent-orchestration）

**主 Agent 只负责与用户沟通、理解需求、拆解任务；所有具体操作（代码修改、文档撰写、命令执行等）必须委托独立 SubAgent 执行。** 不得以「任务简单」「多处小改」「跨多类文件」为由自行执行。见 `rules/agent-orchestration.mdc`。

## 任务类型 → SubAgent 分工

| 任务类型 | SubAgent | 说明 |
|----------|----------|------|
| 代码搜索、架构理解、重构 | **code-navigator** | SemanticSearch / Serena、符号查找、引用追踪 |
| GitNexus（detect_changes、query、impact 等）| **gitnexus** | 任务开始/改代码前/提交前；主 Agent 不得自行调用 GitNexus MCP |
| 前端代码修改、审查 | **frontend-reviewer** | Next.js/React 实现与审查、性能与类型 |
| 页面/UI 制作 | **page-maker** | graphiti-memory 检索 → page-maker；设计须 ui-ux-pro-max + Graphiti 与文档 |
| TDD 实现 | **tdd-executor** | 写测试 → 实现 → 跑测试并汇报 |
| 测试用例编写 | **test-writer** | 单元测试、集成测试 |
| 文档更新 | **docs-updater** | docs/（含 docs/architecture/ARCHITECTURE.md）、架构/迁移文档 |
| 配置维护 | **project-updater** | .cursor/ Rules、SubAgents、Skills、Commands、README |
| 任务收尾流程 | **post-task-reviewer** | Graphiti → Serena → 重构 → 文档 → 知识同步 |
| 记忆检索与写入 | **graphiti-memory** | Graphiti MCP 检索、写入；按文档整体重构记忆 |
| 浏览器/E2E 验证 | **browser-tester** | Chrome DevTools MCP 验证页面、控制台、网络 |
| API 接口测试 | **api-tester** | FastAPI 扩展服务接口测试 |
| Docker 配置与调试 | **docker-expert** | 容器、网络、编排 |
| LaTeX 内容编译 | **latex-expert** | LaTeX 源文件、MDX、课程内容 |
| LLM 配置调试 | **llm-config** | 批改服务、模型切换、LiteLLM、AI SDK |
| 数据库查询/验证 | **database-tester** | Supabase MCP 查询、验证、数据修复 |
| 代码审查 | **code-reviewer** | 规格符合度 + 代码质量审查（参考 Superpowers）|
| LaTeX 解析与同步 | **latex-parser** | 解析 LaTeX、同步到 DB |
| GitHub 操作（创建/关联 issue、创建 PR、评论等） | **github** | 使用官方 GitHub MCP（mcp.json 中 github，见 .cursor/agents/github.md）；任务前创建或关联 issue、解决后创建 PR（Fixes #N）；**不自行 merge 或删分支**，等用户确认 |
| 复杂功能 7 阶段编排 | **code-explorer**、**code-architect** | `/orchestrate feature` 专用；Phase 2/4 调用 |

## 已配置的 SubAgents（详细）

| SubAgent | 用途 | 何时委托 |
|----------|------|----------|
| **code-navigator** | 代码搜索导航 | 查找代码、理解架构、追踪调用、重构 |
| **gitnexus** | 代码知识图谱 | 任务开始 detect_changes+query、改代码前 impact、提交前 detect_changes；GitNexus MCP |
| **frontend-reviewer** | 前端代码审查与修改 | Next.js/React 实现、审查、性能、类型 |
| **page-maker** | 页面制作 | 新页面；设计流程含 page-maker Rule、ui-ux-pro-max Skill、Graphiti 与项目文档参考；设计系统 + 实现与验证 |
| **tdd-executor** | TDD 计划执行 | 写测试→实现→跑测试 |
| **test-writer** | 测试编写 | 单元测试、集成测试 |
| **docs-updater** | 项目文档更新 | 架构/代码变更后更新 docs/、docs/architecture/ARCHITECTURE.md |
| **project-updater** | 项目配置维护 | 技术栈升级、配置变更后更新 .cursor/ Rules、SubAgents 等 |
| **post-task-reviewer** | 任务收尾流程 | Graphiti → Serena → 重构 → 文档 → 知识同步 |
| **graphiti-memory** | 长期记忆 | 检索、写入 Graphiti |
| **browser-tester** | 浏览器测试 | E2E、页面验证、控制台/网络 |
| **api-tester** | API 接口测试 | FastAPI 接口测试 |
| **docker-expert** | Docker 和容器编排 | 容器问题、网络调试 |
| **latex-expert** | LaTeX 内容编译 | LaTeX 源文件、课程内容 |
| **llm-config** | LLM 配置管理 | 批改服务、模型切换、LiteLLM |
| **database-tester** | 数据库操作 | Supabase 查询、验证、数据修复 |
| **latex-parser** | LaTeX 解析与同步 | 解析 LaTeX、同步到 DB |
| **github** | GitHub 操作 | 使用官方 GitHub MCP（.cursor/mcp.json 中 github），见 .cursor/agents/github.md；创建/关联 issue、创建 PR（Fixes #N）；不自行 merge/删分支，等用户确认 |
| **n8n-workflow** | n8n 工作流管理 | 通过 n8n-mcp 创建/更新/验证/执行 workflow；配合 n8n-skills |
| **code-explorer** | 代码库探索 | `/orchestrate feature` Phase 2 专用；并行 2–3 个，追踪执行路径、映射架构 |
| **code-architect** | 架构蓝图设计 | `/orchestrate feature` Phase 4 专用；并行 2–3 个，输出实现蓝图 |

## 使用方式

### 主 Agent 委托

主 Agent 根据 `agent-orchestration.mdc` 将**边界清晰、可独立完成**的任务委托给对应 SubAgent，保持主上下文清洁。SubAgent 向主 Agent 汇报时优先返回**结论与必要摘要**，避免把整文件、大段代码或冗长日志贴回主会话。

### 手动调用

```
使用 code-navigator 查找 getLessonBySlug 的引用
使用 frontend-reviewer 审查课程列表页的代码质量
使用 tdd-executor 按任务列表执行 TDD
使用 post-task-reviewer 执行任务收尾流程
使用 github 创建本次任务的 issue / 使用 github 创建 PR 并关联 issue（PR 后等用户确认再 merge/删分支）
```

## SubAgent 优先级

项目级别 SubAgent（`.cursor/agents/`）优先于全局 SubAgent。

## SubAgent 与 Skill、Command 配合

- **Skills 原子化**：每个 Skill 完成一个明确小任务或流程，可被多个 SubAgent、Command 组合使用
- **Commands 原子化**：每个 Command 触发一个明确动作，通常委托对应 SubAgent 或组合多个 Skill
- **配合关系**：SubAgent 在执行任务时可引用相关 Skill；Command 可触发 SubAgent 或直接组合 Skill；避免重复造轮子
- **创建前必查**：新建 SubAgent/Skill/Command 前，先查询是否已有类似配置；若有则复用或扩展，若无再建

## 添加新 SubAgent

使用 `create-subagent` skill 或参考现有 SubAgent 的格式创建。创建前必查 `.cursor/rules/project-maintenance.mdc` 中「Rules、Skills、SubAgents、Commands 创建约定」。
