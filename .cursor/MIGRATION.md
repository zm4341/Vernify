# Vernify 项目配置变更记录

本文档记录项目配置和架构的重大变更。

---

## 2026-02-16 - n8n-mcp 社区版替换与 n8n-skills 集成

### 变更内容

将 Cursor 的 n8n 集成从 **n8n 内置 MCP** 替换为社区版 **[czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp)**，并纳入 **n8n-skills** 说明与 n8n-workflow SubAgent，参考 [n8n 官方 Hosting 文档](https://docs.n8n.io/hosting/)。

- **MCP**：`~/.cursor/mcp.json` 中原 `n8n`（URL + Bearer）改为 `n8n-mcp`，使用 `npx n8n-mcp`，环境变量 `MCP_MODE=stdio`、`N8N_API_URL`、`N8N_API_KEY`（需在 n8n 设置 → n8n API 中创建）。具备创建/更新/执行 workflow 能力。
- **Skills**：新增 `.agents/skills/n8n-workflow/SKILL.md`，汇总 n8n-mcp 用法与 [n8n-skills](https://github.com/czlonkowski/n8n-skills) 安装方式（Claude Code 推荐 `/plugin install czlonkowski/n8n-skills`）。
- **Rules**：新增 `.cursor/rules/n8n-mcp.mdc`，约定何时委托 n8n-workflow、安全与官方文档引用。
- **SubAgent**：新增 `.cursor/agents/n8n-workflow.md`，职责为通过 n8n-mcp 创建/更新/验证/执行 workflow；`.cursor/rules/agent-orchestration.mdc` 与 `.cursor/agents/README.md` 分工表增加 n8n-workflow。
- **文档**：新增 `docs/n8n-mcp-and-claude-code.md`（配置、n8n-skills 安装、Cursor 与 Claude Code 分工）；`docs/CLAUDE-CURSOR-COLLABORATION.md` 增加「n8n 工作流与 n8n-mcp」小节并链至该文档。

### 涉及文件

- `~/.cursor/mcp.json`（n8n → n8n-mcp）
- `.agents/skills/n8n-workflow/SKILL.md`（新建）
- `.cursor/rules/n8n-mcp.mdc`（新建）
- `.cursor/agents/n8n-workflow.md`（新建）
- `.cursor/rules/agent-orchestration.mdc`（分工表）
- `.cursor/agents/README.md`（SubAgent 表）
- `docs/n8n-mcp-and-claude-code.md`（新建）
- `docs/CLAUDE-CURSOR-COLLABORATION.md`（新增小节）
- `.cursor/MIGRATION.md`（本条目）

### 影响

- Cursor 侧可通过 n8n-mcp 创建/管理 workflow；建 workflow 任务委托 **n8n-workflow** SubAgent。Claude Code 可安装 n8n-skills 与同一 n8n 实例配合使用；协作通过 Graphiti 与 docs 交接。

---

## 2026-02-16 - 新增 n8n-workflow 斜杠命令

### 变更内容

为 n8n-workflow SubAgent 增加 **斜杠命令**，供用户或主 Agent 统一触发 n8n 工作流相关任务。

- **新建**：`.cursor/commands/n8n-workflow.md` — 执行 n8n 工作流创建/更新/验证/执行；主 Agent 须委托 n8n-workflow SubAgent，不直接调用 n8n-mcp；支持命令后带参数（如「建一个 Webhook → Slack workflow」）。
- **更新**：`.cursor/README.md` — Commands 表新增 n8n-workflow 行，斜杠命令数量改为 11 个。
- **更新**：`docs/n8n-mcp-and-claude-code.md` — 增加「斜杠命令 /n8n-workflow」说明与相关文件表 Command 行。
- **更新**：`.cursor/agents/n8n-workflow.md` — 新增「触发方式」小节（斜杠命令 + 直接委托），参考增加 Command。
- **更新**：`.cursor/rules/n8n-mcp.mdc` — 新增「触发方式」与 Command 参考。

### 涉及文件

- `.cursor/commands/n8n-workflow.md`（新建）
- `.cursor/README.md`、`docs/n8n-mcp-and-claude-code.md`、`.cursor/agents/n8n-workflow.md`、`.cursor/rules/n8n-mcp.mdc`
- `.cursor/MIGRATION.md`（本条目）

### 影响

- 用户输入 `/n8n-workflow` 即可委托 n8n-workflow 执行；与现有 post-task-review、page-maker 等命令一致，主 Agent 不直接执行，仅委托 SubAgent。

**记忆**：建议委托 **graphiti-memory** 将「新增 n8n-workflow 斜杠命令及文档更新」写入 Graphiti（group_id: vernify），便于后续检索。

---

## 2026-02-24 - docs/ 新增 Claude Code × Cursor 协作说明

### 变更内容

在 **docs/** 下新增单一权威文档，集中说明 Claude Code 与 Cursor 的协作架构（原仅分散于 CLAUDE.md、claude-code-bridge SKILL、use-claude-code 命令中）。

- **新建**：`docs/CLAUDE-CURSOR-COLLABORATION.md` — 协作架构、共享层（Graphiti、docs/、Skills）、关键文件、分工原则、委托与回写流程；引用 CLAUDE.md、claude-code-bridge/SKILL.md、project-structure.mdc、GRAPHITI-USAGE.md。
- **新建原因**：在文档根 docs/ 内提供一处可被引用的权威说明，便于 AI 与开发者查阅，且不重复 ARCHITECTURE.md（该文件专注应用/运行架构）。

### 涉及文件

- `docs/CLAUDE-CURSOR-COLLABORATION.md`（新建）
- `.cursor/MIGRATION.md`（本条目）

---

## 2026-02-22 - 纳入 Claude Code × Cursor 协作架构

### 变更内容

用户使用 Claude Code 构建与 Cursor 的协作系统；将协作架构纳入 .cursor 配置与项目结构。

- **新增/已有**：根目录 **CLAUDE.md**（Claude Code 项目入口）、**.claude/**（Claude Code 配置）、**.agents/skills/**（共享技能库，含 graphiti-memory、claude-code-bridge）、**.cursor/commands/use-claude-code.md**（Cursor 命令：通过 Graphiti 将任务委托给 Claude Code）。
- **协作**：两工具通过 **Graphiti**（group_id: vernify）与 **docs/** 共享记忆与文档；Cursor 可用 `/use-claude-code` 将 git/构建/测试等 CLI 任务委托给 Claude Code，Claude Code 完成后写回 Graphiti，Cursor 可读。
- **配置更新**：`.cursor/rules/project-structure.mdc` 目录结构补充 CLAUDE.md、.claude/、.agents/skills/、.cursor/commands/use-claude-code.md，核心规则与参考增加 Claude Code × Cursor 协作说明；`.cursor/README.md` Commands 表与「与外部工具协作」小节增加 /use-claude-code；根目录 `.cursorrules` 增加「协作（Claude Code × Cursor）」一条。

### 涉及文件

- `.cursor/rules/project-structure.mdc`
- `.cursor/README.md`
- `.cursorrules`（根目录）
- `.cursor/MIGRATION.md`（本条目）

### 影响

- Cursor 与 Claude Code 通过 Graphiti 和 docs/ 协作的约定已写入项目配置；分工与协议见 `CLAUDE.md`、`.agents/skills/claude-code-bridge/SKILL.md`。

---

## 2026-02-22 - 文档或规则更新时同步根目录 .cursorrules

### 变更内容

当 docs/ 或 .cursor/rules/ 有更新且影响根目录 **.cursorrules** 摘要时，须同步更新 **.cursorrules**，以便 Claude Code 等从根目录读取规则的工具始终拿到与 docs/、.cursor/rules/ 一致的摘要。

- **docs 变更时**：由 **docs-updater** 在更新 docs/ 时按需同步 .cursorrules（若摘要受影响）。
- **仅 .cursor 配置变更时**：若仅 .cursor/rules、agents、skills、commands 变更而 docs 未变，由 **project-updater** 同步 .cursorrules。

### 涉及文件

- `.cursor/rules/docs-updater.mdc` — 收尾约定、与 project-updater 分工表补充 .cursorrules 同步责任
- `.cursor/rules/project-maintenance.mdc` — 需要更新的场景新增 §6（.cursor 配置变更且影响 .cursorrules 时须同步）
- `.cursor/agents/project-updater.md` — 职责中增加 .cursorrules 同步
- `.cursorrules`（根目录）— 增加同步约定说明

### 影响

- 文档或规则有重大更新时，执行文档/配置更新的 SubAgent 或主 Agent 会在本次流程内同步根目录 .cursorrules，保持摘要一致。

---

## 2026-02-22 - 按 Graphiti 官方说明与用户指令更新 Graphiti 使用约定

### 变更内容

按 Graphiti 官方说明（GitHub MCP README、aivi.fyi Cursor Rules）及用户提供的「Instructions for Using Graphiti's MCP Tools for Agent Memory」更新相关文档与配置，确保与「Graphiti 是记忆系统且需记录做过的事」一致。

- **新建** `docs/GRAPHITI-USAGE.md`：集中说明 Graphiti 在 Vernify 中的用途与使用约定（任务前先搜索、始终保存、工作过程中遵循、最佳实践）。
- **更新** `.cursor/rules/graphiti-memory.mdc`：开头增加「Graphiti 是记忆系统并记录做过的事」；补充实体类型 Requirement、按实体类型过滤与审查所有匹配；明确「记录做过的事」与「始终保存」；最佳实践保留 center_node_uuid、建议前先搜索、主动识别模式；参考增加 GitHub MCP README、aivi.fyi Cursor Rules、docs/GRAPHITI-USAGE.md；说明 search_facts 在 Vernify 中对应 search_memory_facts。
- **更新** `.cursor/skills/graphiti-memory/SKILL.md`：描述强调记忆系统与记录做过的事；工具表注明 Requirement、search_memory_facts 对应关系；执行流程与任务前先搜索/始终保存/工作过程中遵循/最佳实践对齐；参考增加 docs/GRAPHITI-USAGE.md 与两个 URL。
- **更新** `.cursor/agents/graphiti-memory.md`：description 与开头补充「记录做过的事情」；工作流程与原则与 Rule/Skill 一致；参考增加 docs/GRAPHITI-USAGE.md 与两个 URL。
- **更新** `.cursor/commands/graphiti-memory.md`：参考小节增加详细使用说明（docs/GRAPHITI-USAGE.md、graphiti-memory.mdc）与官方说明链接（Graphiti MCP README、aivi.fyi Cursor Rules）。

### 涉及文件

- `docs/GRAPHITI-USAGE.md` — 新建
- `.cursor/rules/graphiti-memory.mdc`
- `.cursor/skills/graphiti-memory/SKILL.md`
- `.cursor/agents/graphiti-memory.md`
- `.cursor/commands/graphiti-memory.md`

### 影响

- AI 与开发者可统一查阅 `docs/GRAPHITI-USAGE.md` 与更新后的 Rule/Skill/SubAgent/Command，明确 Graphiti 为记忆系统且需记录做过的事；任务前先搜索、始终保存、工作过程中遵循、最佳实践与官方 Cursor Rules 对齐。

---

## 2026-02-22 - 恢复根目录 .cursorrules

### 变更内容

- **恢复** 根目录 `.cursorrules` 文件，供 **Claude Code** 等仅从根目录读取规则的工具使用。
- **原因**：此前 .cursorrules 已迁移至 .cursor/rules/ 并被删除；因兼容性需要保留根目录入口。
- **内容**：简洁摘要与指针，含项目简介、目录约定、文档根、规则入口（含 Graphiti 检索、page-maker 委托）、运行方式、禁止项；完整规则仍在 `.cursor/rules/`，.cursorrules 不复制 .mdc 全文。

### 涉及文件

- `.cursorrules`（根目录）— 新建（恢复）
- `.cursor/README.md` — Rules 小节补充根目录 .cursorrules 说明

### 影响

- Claude Code 等工具可从根目录读取 .cursorrules 获得项目约定与规则入口；Cursor 继续使用 `.cursor/rules/`。

---

## 2026-02-22 - 强化 UI/页面修改必须委托 page-maker

### 变更内容

**触发原因**：主 Agent 多次自行修改 UI 代码（如 AdminSidebar、LaTeX 同步页），违反 agent-orchestration 约定。需强化规则，确保主 Agent 不再自行修改 UI/页面代码。

**核心约定**：于 agent-orchestration、page-maker 中明确——涉及 `Web/app/`、`Web/components/` 的任何写操作（含改链接、删 DOM、改样式、调布局等）一律委托 page-maker；主 Agent 不得直接改动，无论改动大小，无例外。

### 涉及文件

- `.cursor/rules/agent-orchestration.mdc` — 主 Agent 禁止直接执行小节新增 UI/页面路径强制委托约定；任务类型表「页面/UI 制作」补充范围说明
- `.cursor/rules/page-maker.mdc` — 强制使用小节新增「删除或修改 UI 元素、链接、样式、布局等均视为页面修改，必须委托 page-maker，不区分改动大小」

### 影响

- 主 Agent 收到涉及 `Web/app/`、`Web/components/` 的修改请求时，将一律委托 page-maker，不得自行执行 StrReplace/Write。

---

## 2026-02-22 - LaTeX 同步页 UI 简化

### 变更内容

**触发**：LaTeX 同步页（Admin）UI 简化，移除冗余展示与提示。

**具体修改**：
1. **移除「已选」展示框**：不再单独展示 displayPath 框
2. **移除提示文案**：删除「若需显示本机完整路径，请使用「输入路径」」提示
3. **调整「选择或输入目录」区域布局**：来源组（选择文件夹 + 输入路径）与扫描操作分列；`flex flex-col sm:flex-row` 响应式布局，小屏纵向、大屏横向

### 涉及文件

- `Web/app/admin/latex-sync/page.tsx`

### 影响

- 界面更简洁；来源指定与扫描操作逻辑分组更清晰；响应式布局适配不同屏幕

---

## 2026-02-22 - post-task-review 完整流程执行

### 变更内容

**触发**：用户请求执行 post-task-workflow 完整流程。

**执行结果**：
- **交付前验证**：`cd Web && npm run build` 通过，无 Lint/类型错误
- **流程一**：
  1. Graphiti 检查：检索到 Admin 布局、auto-record-changes、post-task-reviewer、主 Agent 汇报后委托流程等既有记录，与 MIGRATION、上下文一致
  2. Serena 分析：Admin 模块（page.tsx、AdminLayoutClient、AdminSidebar）符号结构清晰，依赖合理
  3. 重构：无必要，架构无问题
  4. 文档：本条目记录
  5. Graphiti 记录：已写入本次执行摘要
- **流程二**：配置与 Graphiti 已同步，无需额外更新

### 涉及上下文

- Admin 页面布局（2026-02-16 居中与自适应）、Admin 重构（2026-02-22 page-maker）
- auto-record-changes 规则（2026-02-16 建立）
- post-task-workflow 流程执行

---

## 2026-02-16 - 新增自动查询与记录规则（auto-record-changes）

### 变更内容

**触发原因**：用户反馈 SubAgent（如 page-maker）完成修改后没有自动记录和更新。需在现有规则基础上增加规则，确保修改完成后自动查询与记录。

**核心约定**：建立 SubAgent 完成变更后主 Agent 必须**立即**委托 post-task-reviewer 进行查询与记录的规则，确保修改有据可查。

### 涉及文件

- `.cursor/rules/auto-record-changes.mdc` — 新建（alwaysApply: true）
- `.cursor/rules/page-maker.mdc` — 新增「完成后必做」小节
- `.cursor/rules/post-task-workflow.mdc` — 触发方式中新增「SubAgent 完成变更后」
- `.cursor/rules/task-priority-workflow.mdc` — SubAgent 职责强化
- `.cursor/rules/agent-orchestration.mdc` — 主 Agent 职责补充
- `.cursor/rules/project-maintenance.mdc` — Rules 清单新增 auto-record-changes

### 影响

- 主 Agent 收到 SubAgent（page-maker、frontend-reviewer、code-navigator 等）完成汇报后，第一动作为委托 post-task-reviewer 做查询与记录，不得跳过、不得等用户提醒。

---

## 2026-02-16 - Admin 页面居中与自适应布局调整

### 变更内容

**触发原因**：用户反馈 Admin 概览页、LaTeX 同步页 UI 未居中、缺乏自适应。

**变更**：page-maker 完成
- 概览页、LaTeX 同步页：根容器增加 max-w-5xl / max-w-4xl、mx-auto、px-4 sm:px-6 md:px-8
- AdminLayoutClient：p-6 改为 p-4 sm:p-6 md:p-8

### 涉及文件

- `Web/app/admin/page.tsx`
- `Web/app/admin/latex-sync/page.tsx`
- `Web/app/admin/AdminLayoutClient.tsx`

### 影响

- Admin 主内容居中、响应式留白、构建已通过

---

## 2026-02-22 - 文档创建原则调整为「不创建重复文档」为主旨

### 变更内容

**触发原因**：将文档创建原则表述更精确，明确 primary goal 为避免重复文档，新建须非常严谨。

**核心宗旨**：
- **主要宗旨**：不创建重复文档（primary goal: avoid duplicate documents）
- **新建允许**：确有需要时可创建新文档，但流程须**非常严谨**（very rigorous）：完成创建前必查、必要性分析、记录新建原因

### 涉及文件

- `docs/DOCUMENT-CONVENTIONS.md` — 将「不无限创建文档」改为「核心宗旨：不创建重复文档 + 新建须非常严谨」；§3 增加「分析必要性」「记录新建原因」
- `.cursor/rules/agent-orchestration.mdc` — 同步上述表述
- `.cursor/rules/auto-update-docs.mdc` — 原则处改为「不创建重复文档」
- `.cursor/rules/docs-updater.mdc` — 统一做法同步
- `.cursor/rules/project-maintenance.mdc` — 创建前必做增加步骤 5、若无再建补充「非常严谨」
- `.cursor/rules/project-structure.mdc` — 创建文件前必做描述更新
- `.cursor/skills/docs-updater/SKILL.md` — 统一做法同步
- `.cursor/agents/docs-updater.md` — 统一做法、创建前必做同步

### 影响

- 所有 SubAgent 以「不创建重复文档」为主要宗旨；新建时须走非常严谨流程（创建前必查、必要性分析、记录新建原因）。

---

## 2026-02-22 - 强化「不无限创建文档」规则

### 变更内容

**触发原因**：确保所有 SubAgent 遵循「不无限创建文档」原则，避免产生 v1/v2/_old/_new 等多版本堆积。

**核心约定**：
- **默认只替换**：更新文档时用新内容替换现有文件，不保留多个版本
- **仅在确需时新建**：如新迁移记录、新领域文档；新建前须完成「创建前必查」流程
- **所有 SubAgent 均须遵循**：docs-updater、project-updater、post-task-reviewer 等均受此约束

### 涉及文件

- `docs/DOCUMENT-CONVENTIONS.md` — 新增置顶小节「核心原则：不无限创建文档」
- `.cursor/rules/project-maintenance.mdc` — 创建前必查处强调「优先修改现有文件，仅无法满足才新建」；Rules/Skills 创建约定强调「优先修改现有」
- `.cursor/rules/docs-updater.mdc` — 统一做法补充「默认只替换；仅确需新建时完成创建前必查后再新建」
- `.cursor/rules/agent-orchestration.mdc` — 新增「所有 SubAgent 均须遵循：不无限创建文档，默认只替换」约束
- `.cursor/rules/auto-update-docs.mdc` — 原则处补充「不无限创建文档」与创建前必查

### 影响

- 所有 SubAgent 在更新或创建文档时，将默认只替换现有文件；仅当明确需要新建时，完成创建前必查后再新建，避免多版本堆积。

---

## 2026-02-22 - LLM/LiteLLM 配置变更后必须由专门 SubAgent 记录

### 变更内容

**新建规则**：建立 LLM / LiteLLM 配置变更后的记录规范，确保变更可追溯。

- **新建** `.cursor/rules/llm-config.mdc`：规定 llm-config 子代理完成 LLM、LiteLLM、批改服务、模型列表等配置变更后，**必须**委托 project-updater、docs-updater、graphiti-memory 完成记录
- **更新** `.cursor/agents/llm-config.md`：在职责或工作流程末尾增加「变更后必做」小节
- **更新** `.cursor/rules/project-maintenance.mdc`：在「需要更新的场景」中补充「LLM / LiteLLM / 模型列表变更」（§5），并指向 llm-config.mdc；Rules 清单新增 llm-config.mdc

### 记录范围

- MIGRATION.md：记录本次 LLM 配置变更（模型列表、环境变量等）
- 相关 docs（如 TECH-STACK-ANALYSIS 若含模型说明）
- Graphiti：用 add_memory 记录模型列表、OpenRouter 配置等变更摘要

### 涉及文件

- `.cursor/rules/llm-config.mdc` — 新建
- `.cursor/agents/llm-config.md` — 新增变更后必做
- `.cursor/rules/project-maintenance.mdc` — 新增场景 §5、Rules 清单

### 影响

- llm-config 子代理完成 LLM 相关配置变更后，将自动委托 project-updater、docs-updater、graphiti-memory 完成记录，确保变更可追溯。

---

## 2026-02-22 - docs/architecture consolidation 执行（合并、删除、单一数据源）

### 变更内容

- **TECH-STACK-ANALYSIS.md 合并**：吸收 SERENA-TECH-STACK、SERENA-CODE-ANALYSIS 独特内容并替换原文件
  - 来自 SERENA-TECH-STACK：依赖版本（§2）、Import 模式（§10）、版本兼容性（§11）
  - 来自 SERENA-CODE-ANALYSIS：FastAPI 死代码、重构建议（§13）、content/ 与 lib/content（§12）
- **删除**：`docs/architecture/SERENA-TECH-STACK.md`、`docs/architecture/SERENA-CODE-ANALYSIS.md`
- **ARCHITECTURE.md §6**：SERENA-CODE-ANALYSIS 引用改为 TECH-STACK-ANALYSIS
- **.serena/memories/vernify-font-lxgw-wenkai.md**：改为简短引用（字体规范见 font-lxgw-wenkai.mdc 与 PRD §4）
- **docs/DOCUMENT-CONVENTIONS.md**：新增 docs/architecture 单一数据源表格（ARCHITECTURE、PRD、TECH-STACK-ANALYSIS、MODULARIZATION）

### 涉及文件

- `docs/architecture/TECH-STACK-ANALYSIS.md` — 替换为合并后内容
- `docs/architecture/SERENA-TECH-STACK.md` — 已删除
- `docs/architecture/SERENA-CODE-ANALYSIS.md` — 已删除
- `docs/architecture/ARCHITECTURE.md`、`.serena/memories/vernify-font-lxgw-wenkai.md`、`docs/DOCUMENT-CONVENTIONS.md`

---

## 2026-02-22 - 规范文件列表统一（graphiti-memory、docs-updater）

### 变更内容

- **规范文件列表（单一数据源）**：根据 consolidation 结果，统一为 8 个规范文件：
  - `.cursor/rules/project-structure.mdc`
  - `docs/architecture/ARCHITECTURE.md`
  - `docs/architecture/TECH-STACK-ANALYSIS.md`（合并后技术栈+数据流）
  - `docs/architecture/PRD.md`
  - `docs/architecture/MODULARIZATION.md`
  - `docs/migration/CONTENT-SOURCE-MIGRATION.md`
  - `.cursor/rules/refactor-convention.mdc`
  - `.cursor/rules/agent-orchestration.mdc`
- **删除 SERENA-TECH-STACK、SERENA-CODE-ANALYSIS**：规范文件不再包含它们。
- **统一原则**：
  - **修改即替换**：更新文档时用新内容替换原文，不保留多个版本。
  - **不生成新文件**：除非明确需要新建（如新迁移记录），否则不新建「v2」「_new」等。
  - **Graphiti 写入仅依据上述规范文件**，保证与 docs 一致。

### 涉及文件

- `.cursor/rules/graphiti-memory.mdc` — 规范文件表新增 PRD.md、MODULARIZATION.md
- `.cursor/agents/graphiti-memory.md` — 规范文件列表（6→8 个）
- `.cursor/skills/graphiti-memory/SKILL.md` — 规范文件引用
- `.cursor/rules/docs-updater.mdc` — 文档范围移除 SERENA-*，新增「统一做法」
- `.cursor/agents/docs-updater.md` — 维护范围、统一做法、规范文件 8 个
- `.cursor/skills/docs-updater/SKILL.md` — 维护的文档、统一做法、规范文件 8 个
- `docs/DOCUMENT-CONVENTIONS.md` — 新增「修改即替换、单一数据源」原则

### 影响

- graphiti-memory 与 docs-updater 对规范文件的定义一致；文档更新遵循修改即替换、单一数据源；Graphiti 记忆与 docs 保持一致。

---

## 2026-02-22 - 合并 Web/.cursor 到根 .cursor/

### 变更内容

- **迁移**：将 `Web/.cursor/` 合并到根 `.cursor/`
  - `Web/.cursor/rules/zustand.mdc` → `.cursor/rules/zustand.mdc`（根目录原先无此规则）
  - `Web/.cursor/skills/ui-ux-pro-max/` → 覆盖 `.cursor/skills/ui-ux-pro-max/`（含 scripts/、data/ 完整迁移）
- **删除**：迁移完成后删除整个 `Web/.cursor/` 目录
- **ui-ux-pro-max 输出路径**：design-system 输出由 `design-system/` 改为 `docs/design-system/<project>/`（MASTER.md、pages/）
- **SKILL.md 命令路径**：脚本调用改为 `python3 .cursor/skills/ui-ux-pro-max/scripts/search.py`

### 涉及文件

- `.cursor/rules/zustand.mdc` — 新增（由 Web 迁入）
- `.cursor/skills/ui-ux-pro-max/*` — 以 Web 版覆盖，scripts/design_system.py、search.py、SKILL.md 更新 design-system 输出路径
- `Web/.cursor/` — 已删除

### 影响

- 配置统一在根 `.cursor/`，无 Web 子目录下的 .cursor
- ui-ux-pro-max 的 `--persist` 输出写入 `docs/design-system/<project>/`，与 docs/ 文档根一致

---

## 2026-02-22 - design-system 目录迁移至 docs/

### 变更内容

- **迁移**：`Web/design-system/` 整体迁移至 `docs/design-system/`
- **示例**：`Web/design-system/vernify-math-learning/MASTER.md` → `docs/design-system/vernify-math-learning/MASTER.md`
- **删除**：`Web/design-system/` 已移除

### 引用更新

- `project-structure.mdc`：在 docs/ 目录树中新增 `design-system/`（设计系统；ui-ux-pro-max 输出）
- ui-ux-pro-max Skill 输出路径已指向 `docs/design-system/<project>/`（见上条迁移）

### 涉及文件

- `docs/design-system/vernify-math-learning/MASTER.md` — 新建（迁移自 Web）
- `Web/design-system/` — 已删除
- `.cursor/rules/project-structure.mdc` — docs 目录新增 design-system 条目

### 影响

- design-system 统一位于 docs/，符合 docs/ 唯一文档根约定

---

## 2026-02-22 - 强化「任务开始必须先 Graphiti 检索，不得跳过」

### 变更内容

**触发原因**：用户反馈主 Agent 在做任何事之前**没有**先进行 Graphiti 检索。需强化「任务开始必须先查 Graphiti（和必要时的 Serena、文档）」的约定，使其更醒目、可执行。

**核心约定**：主 Agent 在做任何事之前，**必须先**执行 Graphiti 检索，**不得跳过**。此为第一步，无可例外。

### 修改文件

- `.cursor/rules/task-priority-workflow.mdc` — 将「任务开始时：先检索」置于最前、加 ⚠️ 标注；明确「主 Agent 必须先执行 Graphiti 检索，不得跳过」；第 1 步标注「必做，不得跳过」
- `.cursor/rules/agent-orchestration.mdc` — 「任务开始时：优先执行」小节强化 Graphiti 检索为第一步、必做、不得跳过
- `.cursor/rules/graphiti-memory.mdc` — 新增「每次任务开始必须先用 Graphiti 搜索（必做，不得跳过）」置顶小节；既有小节第 1 步同步标注
- `.cursor/rules/project-structure.mdc` — 新增「任务开始必做：先 Graphiti 检索（不得跳过）」置顶小节
- `.cursor/hooks/session-init.sh` — ADDITIONAL_CONTEXT 强化「第一步必须先 Graphiti 检索，不得跳过」
- `.cursor/skills/graphiti-memory/SKILL.md` — 硬性要求强化「必须先用 Graphiti 检索，不得跳过」
- `.cursor/skills/agent-orchestration/SKILL.md` — 任务开始时段落强化「必做、不得跳过」
- `.cursor/agents/graphiti-memory.md` — 新增「任务开始必须先 Graphiti 检索（必做，不得跳过）」小节

### 影响

- 主 Agent 在每次任务开始时会醒目看到「先 Graphiti 检索，不得跳过」；session-init 钩子会注入相同提醒；多份 Rules/Skills/SubAgents 一致表述，降低漏执行概率。

---

## 2026-02-22 - .cursorrules 迁移至 .cursor/rules/

### 变更内容

- **删除** 根目录 `.cursorrules`
- **迁移**：其内容已完全包含于 `.cursor/rules/project-structure.mdc`（技术栈、开发规范、禁止操作、核心规则等），无需新建规则文件
- **引用更新**：`.cursor/agents/project-updater.md` 中移除 `.cursorrules` 快速索引条目；规则入口统一为 `.cursor/rules/project-structure.mdc`（alwaysApply: true）

### 涉及文件

- `.cursorrules`（根目录）— 已删除
- `.cursor/agents/project-updater.md` — 移除 .cursorrules 引用

### 影响

- 规则集中于 `.cursor/rules/`，根目录更简洁
- 无功能变化：project-structure.mdc 已覆盖全部 .cursorrules 内容

---

## 2026-02-22 - 创建前必查、原子化与可组合性约定

### 变更内容

**1. 创建前必查**

- 新建 Rule/Skill/SubAgent/Command 前，必须查询是否已有类似或可复用配置
- 若有则优先复用或扩展；若无再考虑新建

**2. 原子化与配合**

- **Skills**：尽量原子化，每 Skill 完成一个明确小任务或流程，可被多 SubAgent、Command 组合使用
- **Commands**：原子化，每 Command 触发一个明确动作，可委托对应 SubAgent 或组合多 Skill
- **配合**：Skills、Commands 与 Rules、SubAgents 可组合使用，避免重复造轮子

### 涉及文件

- `.cursor/rules/project-maintenance.mdc` — 明确「创建前必查」「原子化与配合」小节
- `.cursor/rules/agent-orchestration.mdc` — 新增 Rules/Skills/SubAgents/Commands 约定
- `.cursor/agents/README.md` — SubAgent 与 Skill、Command 配合说明
- `.cursor/README.md` — 创建与组合约定总览

### 影响

- 新增 Rule/Skill/SubAgent/Command 时须先查再建；Skills、Commands 须原子化、可组合

---

## 2026-02-22 - 文档规范集中化：docs/DOCUMENT-CONVENTIONS.md

### 变更内容

- **新建** `docs/DOCUMENT-CONVENTIONS.md`：集中记录「文档放置原则」与「创建文件前必做」流程
- **文档放置原则**：所有文档类文件均放在根目录 docs/ 下，docs/ 为唯一文档根
- **创建文件前必做**：1) 查询 docs/ 2) 查询 Graphiti 3) 涉及代码时查询 Serena 4) 分析文件类型、路径、是否重复
- **更新** project-structure.mdc、project-maintenance.mdc、docs-updater.mdc：补充约定并引用 docs/DOCUMENT-CONVENTIONS.md

### 涉及文件

- `docs/DOCUMENT-CONVENTIONS.md` — 新建
- `.cursor/rules/project-structure.mdc`、`project-maintenance.mdc`、`docs-updater.mdc` — 强化约定与引用

---

## 2026-02-22 - 用户约定：文档存放、创建文件前必做、Rules/Skills/SubAgents/Commands 创建规范

### 变更内容

**1. 文档存放原则**

- 所有文档类内容均在根目录 `docs/` 下
- 不在根目录、Web/ 或其他位置散落创建文档；新增文档统一放入 docs/ 相应子目录
- 更新 project-structure.mdc、docs-updater.mdc、docs-updater Agent/Skill，明确此原则

**2. 创建文件前必做**

- 创建任何新文件前：先查询 docs/、Graphiti、Serena，分析要创建什么、放在哪里
- 在 project-maintenance.mdc、agent-orchestration.mdc 中补充此流程
- docs-updater、project-updater 的 SubAgent 描述中提及此流程

**3. Rules、Skills、SubAgents、Commands 创建约定**

- 创建前先查询是否已有类似
- 若无则构建完整一套（Rule + Skill + SubAgent + Command 配套）
- Skills、Commands 原子化：可独立使用、与 Rules/SubAgents 配合；尽量细粒度可组合
- 在 project-maintenance.mdc、create-rule SKILL、create-skill SKILL 中补充

### 涉及文件

- `.cursor/rules/project-structure.mdc` — 新增「docs/ 为唯一文档根」核心规则
- `.cursor/rules/docs-updater.mdc` — 新增文档存放原则
- `.cursor/rules/project-maintenance.mdc` — 新增「创建文件前必做」「Rules/Skills/SubAgents/Commands 创建约定」
- `.cursor/rules/agent-orchestration.mdc` — 新增「创建文件前必做」
- `.cursor/agents/docs-updater.md` — 文档存放原则、创建文件前必做
- `.cursor/agents/project-updater.md` — 创建文件前必做
- `.cursor/skills/docs-updater/SKILL.md` — 文档存放原则
- `.cursor/skills/create-rule/SKILL.md` — Vernify 项目约定（先查询、完整配套）
- `.cursor/skills/create-skill/SKILL.md` — Vernify 项目约定（先查询、原子化、细粒度可组合）
- `.cursor/rules/auto-update-docs.mdc` — docs/ 为唯一文档根
- `.cursorrules` — 核心规则补充 docs/ 为唯一文档根

### 影响

- 文档统一在 docs/ 下；创建文件前需先分析；新增 Rule/Skill/SubAgent/Command 时遵循查询→配套→原子化原则。

---

## 2026-02-22 - 删除根目录 ARCHITECTURE.md

### 变更内容

- **删除** 根目录 `ARCHITECTURE.md`，不再保留根目录的架构入口文件
- **架构文档唯一路径**：`docs/architecture/ARCHITECTURE.md`
- **引用更新**：project-structure.mdc、docs-updater Rule/Agent/Skill、graphiti-memory SKILL、project-maintenance、project-updater、post-task-workflow 等，移除根 ARCHITECTURE 相关描述，统一引用 docs/architecture/ARCHITECTURE.md

### 涉及文件

- `ARCHITECTURE.md`（根目录）— 已删除
- `.cursor/rules/project-structure.mdc` — 目录结构移除根 ARCHITECTURE；docs/architecture/ 说明为唯一架构文档
- `.cursor/rules/docs-updater.mdc` — 维护范围移除根 ARCHITECTURE
- `.cursor/agents/docs-updater.md` — 移除根 ARCHITECTURE
- `.cursor/skills/docs-updater/SKILL.md` — 同上
- `.cursor/skills/graphiti-memory/SKILL.md` — 移除根 ARCHITECTURE 入口指针表述
- `.cursor/rules/project-maintenance.mdc` — 同上
- `.cursor/agents/project-updater.md` — 同上
- `.cursor/README.md`、`.cursor/commands/`、`.cursor/agents/`、`.cursor/skills/post-task-workflow/` 等 — 引用统一为 docs/architecture/ARCHITECTURE.md

### 影响

- 架构文档仅存在于 docs/architecture/ARCHITECTURE.md，无根目录入口

---

## 2026-02-22 - ARCHITECTURE 文档合并为单一数据源

### 原则

- **单一数据源**：`docs/architecture/ARCHITECTURE.md` 为**唯一**架构文档，保留完整内容；不重复书写。
- **根目录 ARCHITECTURE.md**：仅作**极简入口**（2～3 行），指向 `docs/architecture/ARCHITECTURE.md`，供 DeepWiki 等在根目录扫描时发现；不包含任何架构正文。

### 变更内容

- **根目录 ARCHITECTURE.md**：从架构概览缩为极简入口，仅保留「架构文档见 docs/architecture/ARCHITECTURE.md」及用途说明。
- **docs/architecture/ARCHITECTURE.md**：保持不变，作为唯一架构数据源。
- **引用更新**：project-structure.mdc、docs-updater.mdc、docs-updater SubAgent、graphiti-memory SKILL 中将根 ARCHITECTURE 描述统一为「仅作入口指针」。

### 涉及文件

- `ARCHITECTURE.md`（根目录）— 改为极简入口
- `.cursor/rules/project-structure.mdc` — 目录结构说明
- `.cursor/rules/docs-updater.mdc` — 维护范围与单一数据源原则
- `.cursor/agents/docs-updater.md` — 根 ARCHITECTURE 说明
- `.cursor/skills/docs-updater/SKILL.md` — 架构维护范围
- `.cursor/skills/graphiti-memory/SKILL.md` — 规范文件明确为 docs/architecture/ARCHITECTURE.md

### 影响

- 架构描述仅在一处维护，避免根目录与 docs/ 重复；根 ARCHITECTURE 仅用于入口发现。

---

## 2026-02-22 - 文档统一：Vernify 所有服务均在 Docker 中运行

### 变更内容

- **约定强化**：明确文档中统一表述「**Vernify 所有服务均在 Docker 中运行**，不混用本机 `npm run dev` 或 `uvicorn`」
- **修改文件**：
  - `.cursor/rules/project-structure.mdc`：部署与 Docker 配置处改为「所有服务」；禁止操作新增「禁止在宿主机运行 npm run dev 或 uvicorn 与 Docker 混用」
  - `ARCHITECTURE.md`（根目录）：新增「运行方式」小节；技术栈表部署行补充说明
  - `docs/architecture/ARCHITECTURE.md`：新增「运行方式」小节
  - `.cursorrules`：移除前端开发（npm run dev）、后端开发（uvicorn）条目；改为仅保留 Docker 开发命令，并强调所有服务均在 Docker 中运行

### 影响

- 新加入者与 AI 在阅读文档时将明确：Vernify 标准运行方式为 Docker，不混用本机进程。

---

## 2026-02-16 - 新增 docs-updater 文档更新 SubAgent 体系

### 变更内容

- **新建 docs-updater SubAgent**：专责 `docs/`、根目录 `ARCHITECTURE.md` 等架构/业务文档更新；主 Agent 不得自行修改文档，须委托 docs-updater
- **新建 Rule**：`docs-updater.mdc`，规定文档更新须委托 docs-updater
- **新建 Skill**：`docs-updater/SKILL.md`，文档更新工作流
- **新建 Command**：`/update-docs`，快速触发文档更新
- **与 project-updater 分工**：docs-updater 负责 docs/；project-updater 负责 .cursor/ 配置（Rules、SubAgents、Skills、Commands）

### 涉及文件

- `.cursor/agents/docs-updater.md` — 新建
- `.cursor/rules/docs-updater.mdc` — 新建
- `.cursor/skills/docs-updater/SKILL.md` — 新建
- `.cursor/commands/update-docs.md` — 新建
- `.cursor/rules/agent-orchestration.mdc` — 任务类型表新增 docs-updater
- `.cursor/agents/README.md` — 新增 docs-updater
- `.cursor/agents/project-updater.md` — 明确 docs/ 由 docs-updater 负责
- `.cursor/rules/post-task-workflow.mdc` — 更新文档步骤委托 docs-updater
- `.cursor/agents/post-task-reviewer.md` — 同上
- `.cursor/rules/task-priority-workflow.mdc` — 有了结论后委托 docs-updater
- `.cursor/skills/post-task-workflow/SKILL.md` — 同上
- `.cursor/rules/project-maintenance.mdc` — 编排原则与 SubAgents 清单
- `.cursor/README.md` — Rules、SubAgents、Commands、Skills 新增 docs-updater
- `.cursor/commands/post-task-review.md` — 更新文档步骤

### 影响

- 文档更新有专门 SubAgent 负责；主 Agent 不得自行修改 docs/；post-task 流程中「更新文档」步骤委托 docs-updater（文档）与 project-updater（配置）

---

## 2026-02-16 - Serena 全盘分析、文档更新与 chat/route 重构

### 变更内容

- **Serena 分析**：code-navigator 使用 Serena MCP 全盘分析 Vernify 代码架构与运行逻辑，产出 `docs/architecture/SERENA-CODE-ANALYSIS.md`。
- **文档更新**：
  - ARCHITECTURE.md：明确 FastAPI 仅挂载 ai、latex；courses/lessons/quiz/grading/users 未挂载（遗留）；模块边界表标注 Grading 全部在 Next BFF
  - TECH-STACK-ANALYSIS.md：补充 chat/route.ts AI_SERVICE_URL 默认值已统一为 `http://backend:8000`
  - project-structure.mdc：区分 `lib/content`（课时领域）与已删除根目录 `content/`；backend api/v1 标注未挂载路由
- **重构**：`Web/app/api/chat/route.ts` 的 `AI_SERVICE_URL` 默认值从 `http://localhost:8000` 改为 `http://backend:8000`，与 fastapi-proxy、quiz/submit 一致，避免 Docker 下 chat 不可用

### 涉及文件

- `docs/architecture/SERENA-CODE-ANALYSIS.md` — 新建（Serena 分析报告）
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/TECH-STACK-ANALYSIS.md`
- `.cursor/rules/project-structure.mdc`
- `Web/app/api/chat/route.ts`

---

## 2026-02-16 - Graphiti group_id 统一为 vernify

### 变更内容

- **删除** `group_id: vernify-project` 组：已通过 Graphiti MCP `clear_graph(group_ids: ["vernify-project"])` 清空该组下所有节点、边和 episode。
- **统一使用** `group_id: vernify`：Vernify 项目 Graphiti 记忆全部写入 `vernify` 组；不再使用 `vernify-project`。

### 涉及文件

- `.cursor/rules/graphiti-memory.mdc` — 新增 group_id 约定（统一 vernify，不用 vernify-project）
- `.cursor/agents/graphiti-memory.md` — 新增 group_id 约定
- `.cursor/skills/graphiti-memory/SKILL.md` — 新增 group_id 约定

### Graphiti

- 已将「Vernify 统一使用 group_id: vernify，vernify-project 已删除」写入 `vernify` 组。

### 影响

- 后续所有 Graphiti 写入、检索均使用 `group_id: vernify` 或 `group_ids: ["vernify"]`；规则与 Subagent 中已明确该约定。

---

## 2026-02-22 - 根目录新增 ARCHITECTURE.md

### 变更内容

- **新建** 根目录 `ARCHITECTURE.md`：架构概览文件，供 **DeepWiki** 等分析工具在项目根目录优先读取。
- **内容要点**：
  - 明确主后端：Next.js 是主后端（BFF），位于 `Web/app/api/*`，处理所有 `/api/v1/*` 请求
  - 明确 FastAPI 角色：`Web/backend/` 为扩展服务，仅提供 AI、LaTeX 能力，仅被 Next.js 内部调用，不对外暴露
  - 请求流：浏览器 → Caddy → Next.js（默认）→ Supabase / FastAPI（Next 内部调用）
  - 简要、醒目，便于 LLM 读取；引用 `docs/architecture/ARCHITECTURE.md` 与 `docs/architecture/TECH-STACK-ANALYSIS.md` 获取详情

### 涉及文件

- `ARCHITECTURE.md` — 新建（根目录）
- `.cursor/rules/project-structure.mdc` — 目录结构补充 ARCHITECTURE.md；docs/architecture/ 说明补充根目录 ARCHITECTURE.md 用途

### 影响

- DeepWiki 等工具分析 Vernify 时，可在根目录优先读取 ARCHITECTURE.md 快速理解架构；需详情时再读 docs/architecture/ 下文档。

---

## 2026-02-22 - 根目录零散文件整理

### 变更内容

- **根目录零散文件移入 docs 子目录**：
  - `check-background.html` → `docs/debug/check-background.html`（调试用 HTML 页面，用于检查 Vernify 页面背景样式）
  - `courses_response.json` → `docs/samples/courses_response.json`（课程 API 响应示例）
- **新建目录**：`docs/debug/`、`docs/samples/`
- **保留根目录**：`.cursorrules`、`skills-lock.json` 留在根目录
- **Web 目录**：当前文件均为 Docker/Next.js 常规配置，无需移动

### 路径变更

| 原路径              | 新路径                                    |
|---------------------|-------------------------------------------|
| `check-background.html` | `docs/debug/check-background.html`   |
| `courses_response.json` | `docs/samples/courses_response.json` |

### 涉及文件

- `docs/debug/check-background.html` — 新建（由根目录移入）
- `docs/samples/courses_response.json` — 新建（由根目录移入）
- `check-background.html` — 已删除（根目录）
- `courses_response.json` — 已删除（根目录）
- `.cursor/rules/project-structure.mdc` — docs 结构补充 debug/、samples/ 说明

### 影响

- 根目录更简洁；调试与样例文件归入 docs 对应子目录，便于维护与查找。

---

## 2026-02-22 - TECH-STACK-ANALYSIS 加入 Graphiti 规范文件

### 变更内容

- **规范文件扩展**：将 `docs/architecture/TECH-STACK-ANALYSIS.md` 加入 Graphiti 规范文件列表；规范文件从 5 个增至 6 个。
- **用途**：TECH-STACK-ANALYSIS 为 Serena 技术栈分析报告，与 ARCHITECTURE 互补，供 Graphiti 重构时读取。

### 涉及文件

- `.cursor/rules/graphiti-memory.mdc` — 规范文件表新增 TECH-STACK-ANALYSIS.md
- `.cursor/agents/graphiti-memory.md` — 规范文件列表与「6 个文件」表述
- `.cursor/skills/graphiti-memory/SKILL.md` — 规范文件引用
- `.cursor/rules/project-structure.mdc` — docs/architecture/ 补充 TECH-STACK-ANALYSIS 说明

### Graphiti

- 委托 graphiti-memory 将「TECH-STACK-ANALYSIS 已加入规范文件」写入 Graphiti。

### 影响

- Graphiti 整体重构记忆时需读取 TECH-STACK-ANALYSIS.md，确保技术栈理解与 Serena 分析报告一致。

---

## 2026-02-22 - 删除 .kiro 目录、确认 ai-sdk 在 .agents/skills

### 变更内容

- **删除 .kiro**：移除根目录 `.kiro/` 文件夹（Kiro 配置，用户仅用 Cursor，不使用 Kiro）。
- **ai-sdk 位置**：确认 ai-sdk 已安装到 `.agents/skills/ai-sdk`（通过 `npx skills add vercel/ai -y` 安装）。

### 涉及文件

- `.kiro/` — 已删除
- `.agents/skills/ai-sdk/` — 已存在（Marketplace Skills 安装位置）

### 影响

- 项目仅保留 Cursor 相关配置；`.agents/skills/` 为 Marketplace Skills 的安装根目录。

---

## 2026-02-22 - 文档统一到根目录 docs/ 并分类

### 变更内容

- **docs 结构**：根目录 `docs/` 为唯一文档根，子目录按类别划分。
- **目录结构**：
  - `docs/latex/` — LaTeX 解析与同步（spec-latex-to-db.md、spec-latex-to-db-tdd-plan.md、latex-to-db-flow.md）
  - `docs/architecture/` — 架构、PRD、模块化（ARCHITECTURE.md、PRD.md、MODULARIZATION.md，原 Web/docs）
  - `docs/migration/` — 迁移记录（CONTENT-SOURCE-MIGRATION.md）
  - `docs/auth/` — 认证配置（auth-setup.md）
  - `docs/plans/` — 设计文档（brainstorm 输出，保留空目录）
- **删除**：根目录 `docs/spec-latex-to-db.md` 等、`Web/docs/` 下所有文件；`Web/docs/` 可保留为空目录。

### 路径变更

| 原路径 | 新路径 |
|--------|--------|
| `docs/spec-latex-to-db.md` | `docs/latex/spec-latex-to-db.md` |
| `docs/spec-latex-to-db-tdd-plan.md` | `docs/latex/spec-latex-to-db-tdd-plan.md` |
| `docs/latex-to-db-flow.md` | `docs/latex/latex-to-db-flow.md` |
| `Web/docs/ARCHITECTURE.md` | `docs/architecture/ARCHITECTURE.md` |
| `Web/docs/PRD.md` | `docs/architecture/PRD.md` |
| `Web/docs/MODULARIZATION.md` | `docs/architecture/MODULARIZATION.md` |
| `Web/docs/CONTENT-SOURCE-MIGRATION.md` | `docs/migration/CONTENT-SOURCE-MIGRATION.md` |
| `Web/docs/auth-setup.md` | `docs/auth/auth-setup.md` |

### 涉及文件（全量更新）

**Rules**：project-structure.mdc、graphiti-memory.mdc、agent-orchestration.mdc、task-priority-workflow.mdc、post-task-workflow.mdc、project-maintenance.mdc、page-maker.mdc、spec-driven-tdd.mdc

**Skills**：agent-orchestration/SKILL.md、post-task-workflow/SKILL.md、page-maker/SKILL.md

**SubAgents**：graphiti-memory.md、page-maker.md、latex-expert.md、post-task-reviewer.md、code-navigator.md、project-updater.md

**Commands**：post-task-review.md、page-maker.md、spec-driven-tdd.md

**其他**：.cursor/README.md、.cursor/hooks/session-init.sh、.cursor/docs/cursor-hooks.md、.serena/memories/prd-maintenance.md

### 影响

- 所有文档引用需使用 `docs/` 下新路径；`Web/docs/` 不再使用。
- Graphiti 规范文件列表更新为 `docs/architecture/ARCHITECTURE.md`、`docs/migration/CONTENT-SOURCE-MIGRATION.md` 等。

---

## 2026-02-22 - 弃用 .cursor/memories/，记忆统一到 Graphiti（方案 A）

### 变更内容

- **弃用**：`.cursor/memories/` 目录下的 .md 文件不再使用，已全部删除。
- **记忆统一**：Vernify 项目记忆统一使用 **Graphiti**（Neo4j 知识图谱），不再依赖 .cursor/memories/ 下的 .md 文件。
- **迁移内容**：以下关键事实已写入 Graphiti：
  - MCP 路径约定（~/AI/MCPs、Deepwiki 位置）
  - Deepwiki 构建与部署（Docker 内完成）
  - Vernify Docker-only 运行约定
  - 当前年份 2026 约定
  - Supabase MCP Docker HTTP 常驻模式

### 涉及文件

- `.cursor/memories/*.md` — 已删除（ai-mcps-deepwiki-docker.md、ai-mcps-root-directory.md、ai-mcps-supabase-mcp-startup.md、current-year-2026.md、vernify-docker-only.md）
- `.cursor/rules/project-structure.mdc` — 新增「记忆与 Graphiti」约定
- `.cursor/rules/project-maintenance.mdc` — 移除 .cursor/memories 引用
- `.cursor/rules/graphiti-memory.mdc` — 明确不读取 .cursor/memories/，记忆仅来自规范文件与 Graphiti

### 影响

- AI 检索与写入记忆时仅使用 Graphiti 与规范文件，不再读取 .cursor/memories/。
- 超级管理员测试账号等敏感信息未写入 Graphiti，需在项目内其他安全位置维护（如 .env 或内部文档）。

---

## 2026-02-22 - 删除 scripts 目录（根目录与 Web 内）

### 变更内容

- **根目录**：删除 `scripts/` 文件夹
- **Web 内**：删除 `Web/scripts/` 文件夹
- **project-structure.mdc**：从目录结构中移除 scripts；根目录无 scripts，Web 内无 scripts

### 涉及文件

- `scripts/` — 已删除
- `Web/scripts/` — 已删除
- `.cursor/rules/project-structure.mdc` — 目录结构移除 scripts 行

### 影响

- Vernify 项目根目录及 Web 内不再包含 scripts 目录；脚本类需求按需在 Skills 内或外部工具中维护。

---

## 2026-02-22 - Deepwiki 部署文件迁至 ~/AI/MCPs/deepwiki-open

### 变更内容

- **scripts/deploy-deepwiki-open.sh** → 移至 `~/AI/MCPs/deepwiki-open/deploy.sh`；脚本逻辑调整为以脚本所在目录为默认部署目标。
- **deepwiki-deploy-notes.md** → 移至 `~/AI/MCPs/deepwiki-open/DEPLOY-NOTES.md`；说明改为在 deepwiki-open 目录内执行 `./deploy.sh`。
- Vernify 内已删除上述两文件；`project-structure.mdc` 补充 Deepwiki 部署文件位置说明。

### 涉及文件

- `~/AI/MCPs/deepwiki-open/deploy.sh` — 新增
- `~/AI/MCPs/deepwiki-open/DEPLOY-NOTES.md` — 新增
- Vernify 已移除：`scripts/deploy-deepwiki-open.sh`、`deepwiki-deploy-notes.md`
- `.cursor/rules/project-structure.mdc` — 补充 Deepwiki 部署文件位置

### 影响

- Deepwiki 部署与文档统一归位于 `~/AI/MCPs/deepwiki-open`；Vernify 不再包含 deepwiki 部署脚本。

---

## 2026-02-22 - MCP 路径约定：统一在 ~/AI/MCPs

### 变更内容

- **用户约定**：MCP 统一目录 `~/AI/MCPs`（即 `/Users/minzhang/AI/MCPs`）；Deepwiki 部署目录 `/Users/minzhang/AI/MCPs/deepwiki-open`。Vernify 根目录无 MCPs 文件夹。
- **deploy-deepwiki-open.sh**：默认目标由 `$LATTICE_ROOT/MCPs/deepwiki-open` 改为 `$HOME/AI/MCPs/deepwiki-open`；支持 `DEEPWIKI_DIR` 环境变量覆盖；脚本内添加 MCP 路径约定注释。
- **deepwiki-deploy-notes.md**：克隆与启动路径改为 `~/AI/MCPs/deepwiki-open`，脚本说明同步更新。
- **project-structure.mdc**：在「根目录无 compiler/content/Test/MCPs」下补充 MCP 路径约定。

### 涉及文件

- `scripts/deploy-deepwiki-open.sh` — 默认路径改为 ~/AI/MCPs/deepwiki-open
- `deepwiki-deploy-notes.md` — 路径与说明更新
- `.cursor/rules/project-structure.mdc` — 新增 MCP 路径约定

### Graphiti

- 委托 graphiti-memory 将 MCP 路径约定（~/AI/MCPs、deepwiki-open 位置）写入 Graphiti。

### 影响

- 部署 Deepwiki 或查找 MCP 时，以 `~/AI/MCPs` 为根；Deepwiki 在 `~/AI/MCPs/deepwiki-open`。

---

## 2026-02-22 - Rules/Skills/SubAgents/Commands 全面整理与重构

### 变更内容

- **agent-orchestration 规则强化**：
  - 复合任务拆分：若任务同时涉及查找、修改、文档、记忆等，主 Agent 须拆成多步，每步委托对应 SubAgent
  - 禁止自行执行理由：不得以「任务简单」「多处小改」「跨多类文件」为由自行执行
  - 触发词扩展：增加「清理」「更新」「指定」「全盘查询并修改」
  - 硬性自检：执行任何 StrReplace / Write / EditNotebook 前，须自检是否应委托 SubAgent
- **全量整理**：
  - 明确分层关系：Rule（原则）→ Skill（流程）→ SubAgent（执行）→ Command（触发）
  - README 更新：目录结构、Rules 表、Commands 与 SubAgent 对应表
  - agents/README：编排原则与 agent-orchestration 完全一致，补充复合任务、自检约定
  - .cursorrules：修正过时的 compiler/content 引用

### 涉及文件

- `.cursor/rules/agent-orchestration.mdc` — 复合任务拆分、禁止理由、触发词、硬性自检
- `.cursor/skills/agent-orchestration/SKILL.md` — 与 Rule 表述一致
- `.cursor/README.md` — 分层关系、Rules 表、Command→SubAgent 对应
- `.cursor/agents/README.md` — 编排原则强化、分工表与 Rule 一致
- `.cursorrules` — 修正项目结构描述

### 结构调整说明

- **Rule**：alwaysApply 保留核心规则（agent-orchestration、task-priority-workflow、project-structure、post-task-workflow 等）；其余按 glob 或场景触发
- **Skill**：与 Rule 对应者合并表述，通用 Skills（create-rule、create-skill 等）保持独立
- **SubAgent**：分工表与 agent-orchestration 完全一致；description 简明，详细流程指向 Rule/Skill
- **Command**：每个明确对应一个 SubAgent 或流程

### Graphiti

- 完成后委托 graphiti-memory 按规范文件整体重构记忆

---

## 2026-02-22 - Context7 与 Graphiti/Neo4j 约定补充

### 变更内容

- **约定**：使用 Graphiti MCP 或 Neo4j 时，应先通过 Context7 查询其 API/文档（若 Context7 支持）；若 Context7 无对应库，则参考官方文档：Graphiti https://help.getzep.com/graphiti/、Neo4j https://neo4j.com/docs/。
- **触发原因**：code-navigator 确认 Context7 适用库列表中未包含 Graphiti、Neo4j，且无「用 Context7 查 Graphiti/Neo4j」的约定，可能影响操作正确性。

### 涉及文件

- `.cursor/tools-strategy.md` — Context7 小节新增「Graphiti MCP 与 Neo4j」子节
- `.cursor/rules/graphiti-memory.mdc` — 前置小节增加 Context7 查询步骤
- `.cursor/skills/graphiti-memory/SKILL.md` — 执行流程增加「Context7 前置查询」步骤
- `.cursor/agents/graphiti-memory.md` — 工作流程增加 Context7 前置查询
- `.cursor/rules/project-structure.mdc` — 框架与库文档查询处加入 Graphiti、Neo4j

### Graphiti

- 已将「使用 Graphiti/Neo4j 时需用 Context7 查 API（若可用）」写入 Graphiti。

### 影响

- AI 在使用 Graphiti MCP 或 Neo4j 前会先尝试通过 Context7 查询 API；若 Context7 不支持，则参考官方文档。

---

## 2026-02-22 - 新增「重构」约定（refactor-convention）

### 变更内容

- **用户约定的「重构」含义**：简化结构、突出主干、移除冗余；**不是**通过添加补充节点堆叠信息
- **适用范围**：Graphiti 图谱、文档结构、代码架构等
- **目标**：让核心架构/主流程更清晰

### 涉及文件

- `.cursor/rules/refactor-convention.mdc` — 新建，约定文档
- `.cursor/rules/post-task-workflow.mdc` — 第 4 步「重构」补充约定引用
- `.cursor/rules/task-priority-workflow.mdc` — Serena 环节补充约定引用
- `.cursor/rules/graphiti-memory.mdc` — 按文档整体重构记忆补充约定引用
- `.cursor/rules/project-maintenance.mdc` — Rules 清单新增 refactor-convention
- `.cursor/skills/post-task-workflow/SKILL.md` — 重构步骤补充约定
- `.cursor/skills/graphiti-memory/SKILL.md` — 按文档整体重构记忆补充约定
- `.cursor/agents/post-task-reviewer.md` — 流程一「重构」补充约定
- `.cursor/agents/graphiti-memory.md` — 第 4 步补充约定
- `.cursor/commands/post-task-review.md` — 流程一「重构」补充约定

### 影响

- post-task-workflow 中的「重构」步骤按此约定执行（精简式，非堆叠式）
- Graphiti 更新时的「按文档整体重构记忆」亦遵循此约定

---

## 2026-02-22 - LaTeX 解析迁移至 Web/backend

### 变更内容

- **LaTeX 解析逻辑**：从已删除的 `compiler/` 迁移至 `Web/backend/app/services/latex_parser/`
- **latex.py**：改为 `from app.services.latex_parser import parse_content_root`，移除 `_HAS_COMPILER`、`_PROJECT_ROOT`、`_ensure_compiler`
- **scan-from-files / sync-from-scan**：Docker 与本地均可用，解析逻辑在 backend 内
- **scan / sync**：需提供 `content_root` 参数；`sync` 需 `content_root` 在 SyncRequest 中；SVG 复制需设置 `LATEX_ASSETS_DIR` 环境变量

### 涉及文件

- `Web/backend/app/services/latex_parser/__init__.py` — 新建
- `Web/backend/app/services/latex_parser/parser.py` — 新建
- `Web/backend/app/api/v1/latex.py` — 修改导入与逻辑
- `.cursor/rules/latex-to-db.mdc` — 更新核心路径与 API 说明
- `.cursor/skills/latex-parser/SKILL.md` — 更新 Key Files

### 影响

- Docker 镜像包含 latex_parser，无需 compiler 包
- 前端数据流：选择文件夹 → scanFromFiles → syncFromScan 继续可用

---

## 2026-02-22 - agent-orchestration 规则强化：主 Agent 禁止直接写操作

### 变更内容

- **agent-orchestration.mdc**：已增加「主 Agent 不得修改任何代码、配置或文档」的明确表述；强调所有写操作（StrReplace、Write、EditNotebook 等）一律委托 SubAgent；主 Agent 不使用 StrReplace/Write；收到「查找」「分析」「修改」「实现」等请求时，立即委托对应 SubAgent（如 page-maker、code-navigator）
- **agent-orchestration Skill**：与 Rule 同步强化；禁止段落增加 Write、EditNotebook 及「不得修改任何代码、配置或文档」；触发词增加「修改」「实现」

### 涉及文件

- `.cursor/rules/agent-orchestration.mdc` — 主 Agent 禁止直接执行小节已含上述表述
- `.cursor/skills/agent-orchestration/SKILL.md` — 禁止段落与触发词强化

### Graphiti

- 已将本次变更摘要写入 Graphiti（episode：agent-orchestration 规则强化：主 Agent 禁止直接写操作）

### 影响

- 主 Agent 收到「修改」「实现」等请求时，将立即委托 page-maker、code-navigator 等 SubAgent，不直接使用 StrReplace/Write/EditNotebook。

---

## 2026-02-22 - Admin 概览统计卡片：课程数改为学科数

### 变更内容

- **第一张统计卡片**：由「课程数」改为「学科数」
- **Admin stats API**：新增 `subjects: string[]`（去重学科列表），从 groups 的 subject 去重并排序
- **学科数卡片展示**：学科数量 + 学科名称列表（如「数学、语文、英语」），数量为 `stats.subjects.length`，列表用顿号连接

### 涉及文件

- `Web/app/api/v1/admin/stats/route.ts`：返回类型与实现新增 subjects 字段
- `Web/app/admin/page.tsx`：STAT_CARDS 第一项改为学科数，展示学科数量与名称列表

---

## 2026-02-22 - Admin 统计重构：按学科·年级、移除课时数

### 变更内容

- **新增 Admin 统计 API**：`GET /api/v1/admin/stats`，按 `courses.metadata->>'subject'`、`metadata->>'grade'` 分组聚合
- **移除「课时数」**：AdminDashboardPage 不再显示课时数统计卡片
- **按学科·年级展示**：总览卡片（课程数、题目数、用户数）+ 按学科·年级的表格分组
- **数据来源**：courses 表聚合；questions 通过 lesson_id→lessons→courses 关联统计

### 涉及文件

- `Web/app/api/v1/admin/stats/route.ts`：新建 Admin 统计 API
- `Web/app/admin/page.tsx`：调用新 API、移除课时数、增加按学科·年级表格

### 清除课时（lessons）的数据库影响与建议（待办）

- **当前**：已实现方案 (a) —— 仅从 Admin 统计中移除课时数展示
- **可选方案 (b)**：若需彻底清除 lessons 表或课时相关字段，需注意：
  - `questions.lesson_id` 为 NOT NULL 外键引用 `lessons(id)`
  - `submissions`、`progress` 均引用 `lesson_id`
  - 若删除 lessons 表或清空，需先：
    1. 新建迁移：将 questions 改为 course 级关联（如 `course_id`）
    2. 迁移 questions 数据（通过 lessons 查 course_id）
    3. 调整 submissions/progress 的外键与业务逻辑
    4. 删除或清空 lessons 表
  - 若用户明确要求删除 lessons，需单独设计迁移与 questions 重构方案

---

## 2026-02-22 - Admin 页面重构（page-maker）

### 变更内容

- **移除 QUICK_ACTIONS**：AdminDashboardPage 右侧「快捷入口」区块已移除；LaTeX/Manim 解析与同步入口仅保留于 AdminSidebar 导航项。
- **AdminSidebar 可收缩**：收起时 72px 仅显示图标，展开时 224px（w-56）显示完整文字；底部有展开/收起按钮，300ms 过渡动画。
- **AdminLayoutClient**：管理 collapsed 状态（useState），将 collapsed 与 onToggleCollapse 传给 AdminSidebar。

### 涉及文件

- `Web/app/admin/page.tsx`：移除 QUICK_ACTIONS 区块，仅保留统计卡片
- `Web/app/admin/AdminSidebar.tsx`：支持 collapsed  prop，72px/224px 宽度，底部收起按钮
- `Web/app/admin/AdminLayoutClient.tsx`：collapsed 状态管理

### 影响

- Admin 概览页布局简化；LaTeX/Manim 入口统一由侧边栏导航提供；侧边栏可收缩以节省空间。

---

## 2026-02-22 - 移除 latex-manim 兼容重定向

### 变更内容

- **删除**：`Web/app/admin/latex-manim/` 目录（含 page.tsx 重定向页）
- **统一入口**：仅保留 `/admin/latex-sync`，不再兼容旧路径 `/admin/latex-manim`
- **文档**：MIGRATION、project-structure、ARCHITECTURE、latex-to-db 等去除 latex-manim 相关说明

---

## 2026-02-22 - LaTeX/Manim 面板合并与文件夹选择

### 变更内容

- **合并面板**：`/admin/latex-sync` 与 `/admin/latex-manim` 合并为「LaTeX/Manim 解析与同步」单一面板（主入口 `/admin/latex-sync`）；后续已移除 latex-manim 重定向，仅保留 latex-sync
- **文件夹选择**：使用 `showDirectoryPicker()`（File System Access API）选择本机文件夹，递归读取 .tex/.py 文件并发送到后端
- **路径输入**：本地 backend 时支持路径输入框，扫描自定义 content_root
- **API 变更**：
  - `GET /api/v1/latex/scan?content_root=...`：可选 content_root 参数
  - `POST /api/v1/latex/scan-from-files`：接收文件内容 JSON，解析并返回扫描结果
  - `POST /api/v1/latex/sync-from-scan`：使用已扫描数据同步到 DB，不重新解析
- **Admin 入口**：QUICK_ACTIONS 与 AdminSidebar 合并为单一项「LaTeX/Manim 解析与同步」

### 涉及文件

- `Web/app/admin/latex-sync/page.tsx`：合并逻辑、showDirectoryPicker、路径输入
- `Web/app/admin/page.tsx`：QUICK_ACTIONS
- `Web/app/admin/AdminSidebar.tsx`：NAV_ITEMS
- `Web/backend/app/api/v1/latex.py`：scan-from-files、sync-from-scan、content_root
- `Web/lib/api/endpoints/latex.ts`：scanFromFiles、syncFromScan、scan(contentRoot)
- `.cursor/rules/latex-to-db.mdc`：API 说明更新

### Docker 与本地差异

- **Docker 与本地均可用**：LaTeX 解析已迁移至 `Web/backend/app/services/latex_parser/`，Docker 镜像包含该模块；scan-from-files、sync-from-scan 在 Docker 与本地均可使用，不依赖根目录 compiler

---

## 2026-02-22 - Courses 页导航：合并超级管理员链接

### 变更内容

- **文件**：`Web/app/courses/_components/CoursesPageClient.tsx`
- **修改**：合并导航中两个「超级管理员」链接为单一链接
  - 保留指向 `/admin` 的「超级管理员」链接
  - 为其添加图标（profile 头像或 User 图标）
  - 移除原先指向 `/` 的重复链接（超级管理员登录时也显示「超级管理员」，导致重复）

### 影响

- 超级管理员登录后，课程页顶栏仅保留一个「超级管理员」链接，指向 Admin 后台；避免重复入口。

---

## 2026-02-22 - Content 目录处理与 content_anon 匿名卷

### 变更内容

- **Web/content 已删除**：历史遗留 JSON（lessons/*.json 等），应用不读取；课时正文仅来自 DB `lessons.content_source`。
- **根目录 Content 处理**：为避免 Docker 绑定挂载 `../content` 时在宿主机根目录创建 Content 文件夹，backend/worker 改用 **content_anon** 匿名卷挂载 `/app/content`。
- **Docker 配置**：
  - **新增** `Web/docker-compose.override.yml`：为 backend/worker 挂载 `content_anon:/app/content`，显式覆盖以避免绑定挂载。
  - **修改** `Web/docker-compose.dev.yml`：backend/worker 增加 `content_anon:/app/content` 挂载，并声明 `content_anon` volume。

### 影响

- 应用不依赖 content 目录；LaTeX 扫描/同步在 Docker 中仍不可用（之前已如此）。
- 根目录不再因 Docker 绑定挂载而创建 Content 文件夹。

---

## 2026-02-22 - 启用 Cursor Hooks（beforeSubmitPrompt、afterFileEdit）

### 变更内容

- **新增** `.cursor/hooks.json`：配置 Cursor 生命周期 Hooks
  - **beforeSubmitPrompt**：执行 `.cursor/hooks/session-init.sh`，在每次提交 prompt 时注入任务开始必做提醒
  - **afterFileEdit**：执行 `.cursor/hooks/format.sh`，在 Agent 编辑文件后运行 prettier 格式化
- **新增** `.cursor/hooks/session-init.sh`：读取 stdin JSON，输出含 `additional_context` 的 JSON，提醒先 Graphiti 检索、必要时 Serena、读文档；主 Agent 只沟通与委托
- **新增** `.cursor/hooks/format.sh`：读取 afterFileEdit JSON，对修改过的文件（.ts、.tsx、.js、.json、.md 等）运行 `npx prettier --write`，若无 prettier 则跳过
- **新增文档** `.cursor/docs/cursor-hooks.md`：Cursor Hooks 用途、schema、与 Superpowers Hooks 区别
- **更新** `.cursor/docs/superpowers-hooks.md`：增加与 Cursor Hooks 的关系说明

### 说明

- Cursor 当前**不支持** `sessionStart`，故使用 `beforeSubmitPrompt` 作为替代
- 脚本需可执行权限：`chmod +x .cursor/hooks/*.sh`

### 影响

- 每次提交 prompt 时会执行 session-init 提醒；每次 Agent 编辑文件后会尝试格式化，保持代码风格一致。

---

## 2026-02-22 - Rules/Skills/SubAgents/Commands 全面同步与 Graphiti 记忆整体重构

### 变更内容

- **核对与补充**：检查 `.cursor` 下 Rules、Skills、SubAgents、Commands，确保以下约定均已正确体现并已对缺失或不一致处进行修正：
  - 任务开始：先 Graphiti 检索、必要时 Serena、必要时读项目文档
  - 主 Agent 编排：只沟通与反馈，所有具体操作委托 SubAgent
  - 任务前后必做：查询(前)、更新文档+记录(后)，最高优先级、自动化
  - Graphiti 更新：按当前事实修正错误记忆，按文档整体重构，不只追加
  - 交付前：自动修复构建错误和已知错误，交付可用结果
  - 页面设计：page-maker SubAgent + page-maker Rule + ui-ux-pro-max Skill + Graphiti 与文档参考
- **具体修改**：
  - `.cursor/agents/graphiti-memory.md` — 工具名统一为 `search_memory_facts`（原 `search_facts`）
  - `.cursor/commands/graphiti-memory.md` — 同上
  - `.cursor/skills/agent-orchestration/SKILL.md` — 页面/UI 行改为「graphiti-memory → page-maker」，注明先检索、ui-ux-pro-max 与文档
  - `.cursor/skills/post-task-workflow/SKILL.md` — Graphiti 记录步骤补充「按文档整体重构记忆、修正错误记忆，不只追加」
  - `.cursor/agents/post-task-reviewer.md` — Graphiti 记录步骤补充同上
  - `docs/architecture/ARCHITECTURE.md`（原 Web/docs/ARCHITECTURE.md）— 新增「开发与收尾流程」一句，指向 .cursor 规则（task-priority-workflow、agent-orchestration、post-task-workflow）
- **Graphiti**：根据所有约定进行整体重构记忆，将 Vernify 六条核心约定与开发/收尾流程写入 Graphiti，确保 Neo4j 中 Vernify 相关记忆与 Rules、Skills、SubAgents、Commands、文档一致。

### 影响

- 配置与文档、Graphiti 记忆三者一致；后续检索与执行将遵循统一约定。

---

## 2026-02-22 - 页面设计须调用 page-maker Rule、ui-ux-pro-max Skill，参考 Graphiti 与文档

### 变更内容

- **核心约定**：页面设计必须调用 **page-maker** SubAgent，遵循 **page-maker Rule**（`.cursor/rules/page-maker.mdc`），**必须**使用 **ui-ux-pro-max** Skill 生成或确认设计系统，并参考 **Graphiti**（检索与页面设计相关的偏好、程序、事实）及项目文档（`docs/`、`.cursor Rules`）。
- **修改文件**：
  - `.cursor/rules/page-maker.mdc` — 新增「设计阶段必用」小节，明确 ui-ux-pro-max 必用、Graphiti 检索与文档参考；协作工具表中 ui-ux-pro-max 标注为「必用」
  - `.cursor/skills/page-maker/SKILL.md` — 描述、设计前准备、设计系统步骤均强调 ui-ux-pro-max 必用；引用补充 Graphiti 与文档参考；必用 Skill 列表增加 ui-ux-pro-max
  - `.cursor/agents/page-maker.md` — 描述、设计前必做、设计系统均强调 ui-ux-pro-max 必用及 Graphiti 与文档参考
  - `.cursor/README.md` — page-maker Rule/Skill/SubAgent 描述注明页面设计流程含 page-maker Rule、ui-ux-pro-max Skill、Graphiti 与文档参考
  - `.cursor/agents/README.md` — page-maker 分工表与详细表均注明上述流程
- **Graphiti**：已将「页面设计须调用 page-maker SubAgent，运用 page-maker Rule、ui-ux-pro-max Skill，并参考 Graphiti 与相关文档」作为 **Procedure** 写入 Graphiti。

### 影响

- AI 在新建、重构或修改页面时，会先检索 Graphiti、读项目文档，再用 ui-ux-pro-max 生成设计系统，确保设计一致性与可追溯性。

---

## 2026-02-22 - 交付前必须构建通过、已知错误已修复（自动修复约定）

### 变更内容

- **核心约定**：主 Agent 和 SubAgent 应**自动修复构建错误和已知错误**，直接交付可用结果，不把未修复问题留给用户。交付前必须确保构建通过、已知错误已修复；禁止交付带构建失败或已知 bug 的结果。
- **修改文件**：
  - `.cursor/rules/task-priority-workflow.mdc` — 新增「交付前：构建与已知错误」小节
  - `.cursor/rules/agent-orchestration.mdc` — 主 Agent 职责增加「交付前」一条
  - `.cursor/rules/post-task-workflow.mdc` — 新增「交付前（与 task-priority-workflow 一致）」小节
  - `.cursor/skills/post-task-workflow/SKILL.md` — 新增「交付前验证（必做）」段落
  - `.cursor/skills/agent-orchestration/SKILL.md` — 任务开始时后增加「交付前」一条
  - `.cursor/skills/verification-before-completion/SKILL.md` — 新增「交付前必验」及常见场景表「可交付」行
  - `.cursor/agents/frontend-reviewer.md` — 审查流程后增加「交付前」段落
  - `.cursor/agents/post-task-reviewer.md` — 流程二后增加「交付前」段落
  - `.cursor/agents/tdd-executor.md` — 汇报条款增加第 5 条「交付前」
  - `.cursor/agents/page-maker.md` — 流程增加第 6 步「交付前」
- **Graphiti**：已将「自动修复构建错误和已知错误，交付可用结果」作为 **Procedure** 写入 Graphiti。

### 影响

- 主 Agent 与各 SubAgent 在交付前会确保构建通过并修复已知错误，不再把构建失败或已知 bug 留给用户；若暂时无法修完，须在汇报中明确剩余问题与建议。

---

## 2026-02-22 - 任务开始时必做：先 Graphiti、必要时 Serena、必要时读项目文档

### 变更内容

- **约定**：每次任务/对话**开始时**，主 Agent 应**优先**执行：
  1. **Graphiti 检索**：委托 graphiti-memory 或使用 Graphiti MCP 搜索与当前任务相关的偏好、程序、事实。
  2. **必要时 Serena**：若涉及代码分析、查找、重构，委托 code-navigator（使用 Serena）。
  3. **必要时读项目文档**：若上下文不足，先读 `docs/`（如 docs/architecture/ARCHITECTURE.md、docs/architecture/PRD.md）、`.cursor/` 下相关规则或 README。
- **修改文件**：
  - `.cursor/rules/task-priority-workflow.mdc` — 新增「任务开始时：先检索、必要时 Serena、必要时读文档」小节
  - `.cursor/rules/agent-orchestration.mdc` — 新增「任务开始时：优先执行」小节
  - `.cursor/rules/graphiti-memory.mdc` — 新增「任务开始时：先 Graphiti、必要时 Serena、必要时读项目文档」小节，原「开始任何任务之前」改为「开始任何任务之前（Graphiti 部分）」
  - `.cursor/skills/agent-orchestration/SKILL.md` — 新增「任务开始时（优先执行）」段落
- **Graphiti**：已将「任务开始时先检索 Graphiti、必要时 Serena 与读项目文档」作为 **Procedure** 写入 Graphiti。

### 影响

- 主 Agent 在每次任务开始时会优先做 Graphiti 检索，必要时再做 Serena 与读项目文档，保证上下文与既有偏好/程序一致。

---

## 2026-02-21 - Graphiti 记忆维护：按文档整体重构记忆

### 变更内容

- **核心约定**：每次更新 Graphiti 时，需根据**所有**关于 Vernify 的文档理解**整体重构**记忆（删除/修正错误、使全部记忆与文档一致），而**不只是**追加新说法。
- **修改文件**：
  - `.cursor/rules/graphiti-memory.mdc` — 「更新 Graphiti 时」小节标题改为「按文档整体重构记忆」，补充核心约定
  - `.cursor/skills/graphiti-memory/SKILL.md` — 任务后流程与注意事项补充「按文档整体重构记忆」要求
  - `.cursor/agents/graphiti-memory.md` — 工作流程第 4 步补充整体重构记忆说明
  - `.cursor/rules/post-task-workflow.mdc` — Graphiti 记录环节补充「按文档整体重构记忆」要求
  - `.cursor/rules/task-priority-workflow.mdc` — Graphiti 记录环节补充整体重构记忆要求
  - `.cursor/rules/project-maintenance.mdc` — 写入 Graphiti 步骤补充「按文档整体重构记忆」
  - `.cursor/rules/agent-orchestration.mdc` — 主 Agent 职责与 graphiti-memory 分工表补充「按文档整体重构记忆」说明
- **Graphiti**：已将「每次需根据所有 Vernify 文档的理解整体重构 Graphiti 记忆，不只追加」作为 Procedure 写入 Graphiti

### 影响

- AI 在更新 Graphiti 时，必须基于项目文档整体理解，对既有记忆进行删除/修正，使全部记忆与文档一致，禁止仅追加新记忆。

---

## 2026-02-21 - Graphiti 记忆维护：修正错误记忆约定

### 变更内容

- **新增约定**：更新 Graphiti 时，需按当前事实对错误记忆进行修正（删除或改写错误事实，再写入正确记忆），不得仅追加新记忆。
- **修改文件**：
  - `.cursor/rules/graphiti-memory.mdc` — 新增「更新 Graphiti 时：修正错误记忆（必遵）」小节，规定 `delete_entity_edge` / `delete_episode` 删除错误记忆后再写入
  - `.cursor/skills/graphiti-memory/SKILL.md` — 任务后写入流程增加修正错误记忆步骤；注意事项增加本条
  - `.cursor/agents/graphiti-memory.md` — 工作流程增加修正错误记忆步骤
  - `.cursor/rules/post-task-workflow.mdc` — 规则一增加「修正错误记忆」步骤；规则二记录环节补充先修正再写入
  - `.cursor/rules/task-priority-workflow.mdc` — Graphiti 记录环节补充修正错误记忆要求
  - `.cursor/rules/project-maintenance.mdc` — 写入 Graphiti 步骤补充修正错误记忆
  - `.cursor/rules/agent-orchestration.mdc` — 主 Agent 职责与 graphiti-memory 分工表补充修正错误记忆说明

### 影响

- AI 在更新 Graphiti 时，必须先检索既有记忆；若发现与当前事实不符，须先删除或改写错误记忆，再写入正确内容，避免错误记忆累积。

---

## 2026-02-21 - 根目录 content 彻底解决

### 变更内容

- **删除**：项目根目录 `content` 文件夹（若存在则删除）。
- **Docker**：`../content:/app/content` volume 已从 docker-compose 移除（此前已做）；LaTeX 扫描/同步在 Docker 中不可用。
- **数据来源**：应用不依赖根目录 content；课时正文来自 DB `lessons.content_source`，题目来自 `questions` 表。
- **.gitignore**：新增 `content/`（小写），保留 `Content/`（大写），使 Git 不跟踪该目录（`.gitignore` 仅控制 Git 是否跟踪，与目录是否被创建无关；防止创建需移除 Docker volume 等配置）。
- **文档**：`project-structure.mdc`、`CONTENT-SOURCE-MIGRATION.md` 更新根目录 content 说明；Graphiti 已记录本次变更。

### 影响

- 根目录 content 问题已彻底解决；若工具再次创建该目录，`.gitignore` 会使 Git 不跟踪，但不会阻止目录被创建。

---

## 2026-02-16 - 任务前后必做：最高优先级、自动化

### 变更内容

- **新增 Rule**：`task-priority-workflow.mdc`（alwaysApply: true），规定查询（前）、更新文档+记录（后）为最高优先级，应自动化执行，主 Agent 和 SubAgent 均须遵循，无需用户提醒。
- **更新**：agent-orchestration、post-task-workflow、post-task-reviewer、project-updater、code-navigator、graphiti-memory、agent-orchestration Skill、post-task-workflow Skill、project-maintenance

### 影响

- 有了结论后，主 Agent 必须主动委托 post-task-reviewer 或 project-updater 更新文档、配置、Graphiti 记录；不再需要用户每次提醒。

---

## 2026-02-16 - 强化 agent-orchestration：主 Agent 禁止直接查找/分析

### 变更内容

- **agent-orchestration.mdc**：明确主 Agent **禁止**直接使用 SemanticSearch、Grep、Read 等工具；收到「查找」「分析」「查一下」「看看」等请求时**立即委托 code-navigator**
- **agent-orchestration Skill**：同上，并移除「极简任务主 Agent 可直接完成」例外

### 影响

主 Agent 只负责与用户讨论问题、反馈结果；所有具体事情（含查找、分析）委托 SubAgent，保持主上下文清洁。

---

## 2026-02-16 - 基于 Superpowers 优化 Skills、SubAgents、Commands

### 变更内容

- **新增 Skill**：`verification-before-completion`（Evidence over claims，完成前必须验证）
- **新增 Skill**：`finishing-a-development-branch`（分支完成时 merge/PR/保留/丢弃决策）
- **新增 SubAgent**：`code-reviewer`（规格符合度 + 代码质量审查）
- **新增 Command**：`/brainstorm`（探索需求与设计，写代码前）
- **更新**：tdd-executor、tdd-plan-and-implement、spec-driven-tdd 引用 verification-before-completion；agent-orchestration、agents/README 增加 code-reviewer
- **新增文档**：`.cursor/docs/superpowers-hooks.md`（Hooks 用途说明：会话启动时自动执行脚本；Vernify 当前不需要安装）

### 影响

- 完成前必须有验证证据；分支完成时有明确决策流程；可委托 code-reviewer 做两阶段审查；复杂需求可先用 `/brainstorm` 探索设计。

---

## 2026-02-16 - 主 Agent 编排原则（委托优先）

### 变更内容

- **新增 Rule**：`agent-orchestration.mdc`（alwaysApply: true），规定主 Agent 只负责与用户沟通、理解需求、拆解任务；**所有具体操作**（代码修改、文档撰写、命令执行）**必须委托独立 SubAgent**，避免污染主 Agent 上下文。
- **新增 Skill**：`agent-orchestration`，委托矩阵（任务类型 → SubAgent）
- **更新 agents/README.md**：编排原则与任务类型→SubAgent 分工表
- **更新**：post-task-workflow、spec-driven-tdd、project-maintenance、spec-driven-tdd command、post-task-review command，均强调委托优先

### 影响

- 用户与主 Agent 只讨论复杂问题；具体操作由 code-navigator、frontend-reviewer、tdd-executor、project-updater、post-task-reviewer 等 SubAgent 执行。

---

## 2026-02-16 - 任务完成后必做流程（post-task-workflow）

### 变更内容

- **新增 Rule**：`post-task-workflow.mdc`（alwaysApply: true），规定完成任何有实际变更的任务后必须执行两条流程：
  1. **变更检查与重构**：Graphiti 检查 → Serena 分析架构 → 重构 → 更新文档 → Graphiti 记录
  2. **知识同步**：更新 Rules、Skills、SubAgents、Commands；记录到文档和 Graphiti
- **新增 Skill**：`post-task-workflow`，详细描述上述流程
- **新增 SubAgent**：`post-task-reviewer`，负责执行任务完成后的必做流程
- **新增 Command**：`/post-task-review`，触发完整流程
- **更新**：project-maintenance、graphiti-memory、project-updater、spec-driven-tdd 及对应 command，均引用 post-task-workflow

### 影响

- AI 完成有变更的任务后，必须主动执行上述流程或建议运行 `/post-task-review`；不再需要用户每次口述这两条规则。

---

## 2026-02-21 - 术语统一：FastAPI 为扩展服务、Next 为主后端

### 变更内容

- **术语修正**：所有文档中 FastAPI 不再称为「后端」，统一为「扩展服务」或「FastAPI 扩展服务」；Next.js 为主后端。
- **修改文件**：ARCHITECTURE、MODULARIZATION、PRD、project-structure、CONTENT-SOURCE-MIGRATION、spec-latex-to-db、testing-practices、test-writer、api-tester、docker-expert、latex-sync、MIGRATION、SUMMARY、agents/README、docker-compose、.cursorrules、chat/route.ts。

### 影响

- 概念一致：Next.js = 前端 + 主后端；FastAPI = 扩展服务（仅为 Next 提供 AI/LaTeX 等能力）。

### 2026-02-21 补充：Rules、Skills、SubAgents、Commands 架构约定

- **Rules**：page-maker、spec-driven-tdd、mdx-evaluation、lesson-structure、project-maintenance、latex-to-db 均增加「架构约定」小节，说明主后端（Next.js）与扩展服务（FastAPI）。
- **Skills**：page-maker、tdd-plan-and-implement、spec-driven-analysis、test-coverage-strategy、serena-code-structure 增加架构约定或更新相关表述。
- **SubAgents**：code-navigator、page-maker、frontend-reviewer、latex-expert、llm-config、tdd-executor 增加架构约定。
- **Commands**：spec-driven-tdd、page-maker、run-tests 增加架构约定；run-tests 将「后端」改为「扩展服务（FastAPI）」。

---

## 2026-02-21 - 架构重构：Next 为主后端，Caddy 不访问 FastAPI

### 变更内容

- **架构修正**：Next.js 既是前端也是主后端；Caddy 不再代理 FastAPI，仅代理 Next.js 与 Supabase。
- **请求路径**：前端统一走 `/api/v1/*`；AI/LaTeX 由 `app/api/v1/ai/[...path]`、`app/api/v1/latex/[...path]` 代理至 FastAPI（`lib/api/fastapi-proxy.ts`）。
- **API 客户端**：`lib/api/endpoints/ai.ts`、`latex.ts` 路径从 `/ai/api/v1/*` 改为 `/api/v1/*`。
- **Caddy**：移除 `Caddyfile.dev` 中 `/ai/*`、`/ai-health` 到 backend 的代理。
- **文档**：ARCHITECTURE、MODULARIZATION、project-structure、latex-to-db、latex-sync 更新架构描述。

### 影响

- 浏览器仅与 Caddy、Next 通信；Next 与 FastAPI 为服务间直接调用（`AI_SERVICE_URL`）。

---

## 2026-02-21 - 清理 JSON 文件回退逻辑、更新文档、根目录 Content

### 变更内容

- **代码**：`app/lessons/[slug]/page.tsx` 注释简化，移除「已移除 JSON 文件回退」表述（题目数据仅从 DB 读取，无回退逻辑）。
- **文档**：`docs/migration/CONTENT-SOURCE-MIGRATION.md`（原 Web/docs/CONTENT-SOURCE-MIGRATION.md）移除 compiler/JSON 小节，明确「应用不依赖 .md 或 JSON 文件」；`Web/content/lessons/*.json` 为历史遗留，应用完全不使用。
- **Rules**：`project-structure.mdc` 更新 content 目录说明及根目录 Content 处理建议。
- **Agents**：`latex-expert.md` 移除 compiler、JSON 输出引用；数据来源改为「仅 DB，无 JSON」。
- **忽略**：新增根目录 `.gitignore`，使 Git 不跟踪 `Content/`（`.gitignore` 仅控制 Git 跟踪与否，不阻止目录创建）。

### 影响

- 文档与代码一致：课时正文、题目均仅来自 DB，无 JSON 文件参与。
- 根目录 `Content` 文件夹若被工具创建，Git 将不跟踪该目录（`.gitignore` 不阻止其被创建）。

---

## 2026-02-16 - 课程列表与详情页改为 MDX 渲染

### 变更内容

- **新增** `lib/mdx.tsx`：`MdxText` Server Component，用于课程描述等短文本的 MDX 渲染。
- **新增** `lib/course/server.ts`：`getCoursesServer`、`getCourseServer`、`getCourseLessonsServer`、`getCourseQuestionsServer` 服务端数据获取。
- **改造** `app/courses/page.tsx`：改为 Server Component，服务端获取课程并渲染描述，将 `descriptionNodes` 传入 `CoursesPageClient`。
- **改造** `app/courses/[id]/page.tsx`：改为 Server Component，服务端获取课程/课时/题目，用 MDX 渲染课程描述后传入 `CourseDetailClient`。
- **新增** `app/courses/_components/CoursesPageClient.tsx`、`app/courses/[id]/_components/CourseDetailClient.tsx`：客户端组件，接收 MDX 渲染的 `descriptionNode`。

### 影响

- 课程描述支持 Markdown 富文本（粗体、链接、列表等）。

---

## 2026-02-16 - ChatClient 适配 AI SDK v5

### 变更内容

- **app/api/chat/route.ts**：使用 `convertToModelMessages` 将 UIMessage 转为 ModelMessage；`toTextStreamResponse` 改为 `toUIMessageStreamResponse`。
- **components/ChatClient.tsx**：改用 `DefaultChatTransport`、`sendMessage`；用 `useState` 管理 input；消息展示改为 `message.parts`（`part.type === 'text'`）。

### 影响

- 流式对话符合 AI SDK v5 Data Stream 协议，构建通过。

---

## 2026-02-16 - 落地页改为 MDX 渲染

### 变更内容

- **新增** `lib/landing-content.ts`：落地页富文本配置（heroSubtitle、heroDesc、problemTitle、problemDesc、featuresTitle、featureDescs），支持 Markdown 与内联 JSX（如 `<span className="...">`、`<br />`）。
- **改造** `components/LandingClient.tsx`：接受 heroSubtitle、heroDesc 等 ReactNode  props，由服务端传入 MDX 渲染结果；无 props 时使用默认文案回退。
- **改造** `app/page.tsx`：未登录访问首页时，用 `MdxText` 渲染 `landingContent` 各字段后传入 `LandingClient`。
- **更新** `lib/mdx.tsx`：`simpleMdxComponents` 增加 `br` 支持。

### 影响

- 落地页（首页未登录视图）文案可修改 `lib/landing-content.ts` 实现富文本；支持粗体、链接、高亮 span、换行等。

---

## 2026-02-16 - spec-driven-tdd 增加 MDX 评估

### 变更内容

- **commands/spec-driven-tdd.md**：步骤 4「计划与 TDD 实现」增加：若任务涉及新建或修改展示内容的页面，按 mdx-evaluation.mdc 评估是否使用 MDX 渲染。
- **rules/spec-driven-tdd.mdc**：计划阶段增加「页面与 MDX」条目。

### 影响

- 使用 `/spec-driven-tdd` 做涉及页面内容的任务时，计划阶段会自动纳入 MDX 评估。

---

## 2026-02-16 - 新增 MDX 渲染评估规范（mdx-evaluation.mdc）

### 变更内容

- **新增 Rule** `mdx-evaluation.mdc`：开发新页面时必须评估是否使用 MDX 渲染。
- **评估原则**：有 Markdown/MDX 源（DB/CMS/配置）且需富格式 → 使用 MDX；无 Markdown 源或纯表单/操作型 → 不使用。
- **适用页面**：课时、课程描述、落地页 Hero/功能介绍 → 建议用 MDX；登录/注册/聊天/Admin → 不用。
- **Rules**：`page-maker.mdc` 流程增加 MDX 评估步骤；`project-structure.mdc` 增加 mdx-evaluation 引用。
- **Skills**：`page-maker/SKILL.md` 增加 MDX 评估为必做步骤。
- **SubAgents**：`page-maker.md`、`code-navigator.md` 增加 MDX 评估与 mdx-evaluation 引用。
- **Commands**：`page-maker.md` 流程增加 MDX 评估步骤。
- **总览**：`SUMMARY.md`、`README.md` 增加 mdx-evaluation Rule 说明。

### 影响

- AI 在新建页面时会先按 mdx-evaluation.mdc 评估是否需用 MDX 渲染，再进入设计系统与代码实现。
- 课时、课程描述、落地页富文本使用 MDX；登录/注册/聊天/Admin 不使用 MDX。

---

## 2026-02-20 - MDX 内容渲染及 Rules/Skills/Agents/Commands 文档更新

### 变更内容

- **课时内容渲染**：由 ReactMarkdown 改为 **MDX (next-mdx-remote)**，支持 Markdown + JSX 及 FadeIn、LetterByLetter、SlideUp 等动画组件。
- **Rules**：`project-structure.mdc`、`lesson-structure.mdc`、`page-maker.mdc` 增加 MDX 描述。
- **Skills**：`page-maker/SKILL.md` 增加课时页 MDX 与动画组件说明。
- **SubAgents**：`latex-expert.md`、`page-maker.md`、`code-navigator.md` 增加 MDX 描述。
- **Commands**：`page-maker.md` 增加 `/page-maker 课时页` 及 MDX 说明。
- **总览**：`README.md` 增加 MDX 相关描述。

### 影响

- 课时正文可在 `content_source` 中使用 `<FadeIn>`、`<LetterByLetter>`、`<SlideUp>` 等动画；`<QuizBlock id="x" />` 与 ` ```quiz\nx\n``` ` 均支持。
- AI 在涉及课时内容、页面制作、LaTeX 时，会参考 MDX 与动画组件的用法。

---

## 2026-02-20 - 安装 Vercel AI SDK Skill、删除根目录 Content/Test/MCPs/Compiler

### 变更内容

- **安装 Marketplace 中 Vercel 的 Skills**：在项目根执行 `npx skills add vercel/ai -y`，安装 **ai-sdk** skill 到 `.agents/skills/ai-sdk`（并为 Cursor 等建 symlink）。用于 AI SDK、streamText、useChat、Agent、工具调用等场景。
- **删除根目录下四个文件夹**：`content`、`Test`、`MCPs`、`compiler`。LaTeX 解析与 Manim 之后再说。

### 修改文件

- `.cursor/rules/project-structure.mdc` — 目录结构去掉 compiler/content/Test，增加 docs/、scripts/、.agents/skills/；核心规则改为「根目录无 compiler/content/Test/MCPs」；命令速查去掉编译/同步相关命令。

### 影响

- Cursor 等 Agent 会加载 ai-sdk skill（Vercel AI SDK 相关问题时自动触发）。
- 根目录仅保留 Web/、docs/、scripts/、.cursor/、.agents/ 等；课程内容来自 DB（`lessons.content_source`），静态资源在 Web/public/；Web/content 已删除。

### 文档联动（2026-02-20 补充）

- 已更新 **Rules**：`project-structure.mdc`（框架与库处增加 Vercel AI SDK / ai-sdk 引用）、`page-maker.mdc`（协作工具与参考 Skill 增加 ai-sdk）。
- 已更新 **Skills**：`.cursor/skills/README.md`（新增「Marketplace Skills」小节与 ai-sdk 说明，添加新 Skill 方式补充 npx skills add）。
- 已更新 **SubAgents**：`llm-config.md`（description 与「前端 AI 与 Vercel AI SDK」小节）、`frontend-reviewer.md`（可选 Skill 与配合）、`agents/README.md`（llm-config 用途）。
- 已更新 **Commands**：`page-maker.md`（前置与可选 Skill 增加 ai-sdk）。
- 已更新 **总览**：`.cursor/README.md`（Skills 列表）、`.cursor/SUMMARY.md`（实用 Skills 表）。

---

## 2026-02-20 - LiteLLM + Vercel AI SDK 流式对话实现

### 变更内容

- **FastAPI 扩展服务**：新增 OpenAI 兼容流式端点 `POST /api/v1/ai/v1/chat/completions`，使用 LiteLLM `acompletion(stream=True)` 返回 SSE，供 Vercel AI SDK 的 createOpenAI(baseURL) 调用。
- **Next.js（主后端）**：安装 `ai`、`@ai-sdk/openai`、`@ai-sdk/react`；新增 `app/api/chat/route.ts`（streamText + baseURL 指向 FastAPI 扩展服务），新增 `app/chat/page.tsx` 与 `components/ChatClient.tsx`（useChat 流式对话页）。
- **环境变量**：`.env.example` 增加 `AI_SERVICE_URL`、`AI_CHAT_MODEL`；批改仍用现有 `/ai/grade`，不变。

### 影响

- 访问 `/chat` 可使用流式 AI 对话（打字机效果）；后续可在同栈扩展 transcribe / generateSpeech 做口语练习。

---

## 2026-02-20 - RAG 预留：Embedding 与 Rerank 配置及接口

### 变更内容

- **配置**：`backend/app/core/config.py` 增加 `EMBEDDING_MODEL=gemini/gemini-embedding-001`、`RERANKER_MODEL=gemini/gemini-2.5-flash-lite`；`.env.example` 同步说明。
- **接口**：
  - `POST /api/v1/ai/embed`：输入 `input: string[]`，返回 OpenAI 兼容的 embedding 列表，便于写入 Supabase pgvector。
  - `POST /api/v1/ai/rerank`：输入 `query`、`documents`、可选 `top_n`，使用 RERANKER_MODEL 对文档按相关性重排序并返回。
- **文档**：`llm-config` SubAgent 增加 RAG 小节，说明接口与后续 RAG 流程（向量检索 + rerank + LLM）。

---

## 2026-02-20 - 通过 Context7 CLI 安装 Skills（未装 Marketplace Context7 MCP）

### 变更内容

- 使用 **Context7 CLI**（`npx ctx7 skills install ... --cursor`）从 Context7 注册表安装 2 个 Skill 到 `.cursor/skills/`，**未**安装 Marketplace 的 Context7 MCP。
- 新增：**vercel-react-best-practices**（Vercel React/Next.js 性能与最佳实践）、**web-design-guidelines**（Web Interface Guidelines 审查）。

### 修改文件

- `.cursor/skills/README.md` — 新增两 Skill 说明及「Context7 注册表」安装说明
- `.cursor/SUMMARY.md` — Skills 数量 16，实用 Skills 表增加两项
- `.cursor/README.md` — Skills 列表增加两项

### 影响

- 写/审 React/Next.js 代码时可参考 vercel-react-best-practices；做 UI 审查、可访问性审计时可参考 web-design-guidelines。Context7 MCP 仍使用现有配置（如已配），无需从 Marketplace 再装。

### 后续（2026-02-20 联动文档）

- 已更新 **Rule** `page-maker.mdc`、**Subagent** `frontend-reviewer.md` 与 `page-maker.md`、**Skill** `page-maker/SKILL.md`、**Command** `page-maker.md`，在页面制作与前端审查流程中引用 **frontend-design**、**vercel-react-best-practices**、**web-design-guidelines**。

---

## 2026-02-20 - 摘取 Superpowers systematic-debugging（未装整包）

### 变更内容

- 从 **obra/superpowers** 仅摘取 **systematic-debugging** skill 到 `.cursor/skills/systematic-debugging/`（含 SKILL.md 与 root-cause-tracing、defense-in-depth、condition-based-waiting 三份技法），**未**安装 Marketplace 的 Superpowers 整包。
- 在 Rule `testing-practices.mdc`、Command `run-tests.md` 中引用：测试失败或修 bug 时先按 systematic-debugging 做根因调查再修。

### 修改文件

- `.cursor/skills/systematic-debugging/`（新建）
- `.cursor/skills/README.md`、`.cursor/SUMMARY.md`、`.cursor/README.md`
- `.cursor/rules/testing-practices.mdc`、`.cursor/commands/run-tests.md`、`.cursor/MIGRATION.md`

### 影响

- 遇到 bug、测试失败、异常行为时，AI 会优先走四阶段系统化调试（根因 → 模式 → 假设 → 实现），与现有 spec-driven-tdd 流程互补；不引入 Superpowers 整包，无流程冲突。

---

## 2026-02-20 - 新增 Supabase Postgres 最佳实践 Skill 并更新相关文档

### 变更内容

- 新增 Skill **supabase-postgres-best-practices**（来自 supabase/agent-skills），仅复制 Skill 到 `.cursor/skills/`，未安装 Marketplace 的 Supabase MCP。
- 更新 Rules、Skills、Subagent、Commands、SUMMARY、README，使数据库相关流程引用该 Skill。

### 修改文件

- `.cursor/rules/database-supabase.mdc` — 连接方式改为 HTTP 常驻（18492）；迁移与 Schema 增加「参考 supabase-postgres-best-practices」；参考增加两 Skill。
- `.cursor/skills/database-supabase/SKILL.md` — 与 Rule/其他 Skill 配合中增加 supabase-postgres-best-practices。
- `.cursor/agents/database-tester.md` — 配合中增加 supabase-postgres-best-practices。
- `.cursor/commands/database-ops.md` — 参考中增加 supabase-postgres-best-practices。
- `.cursor/SUMMARY.md` — Skills 数量 14；实用 Skills 表增加 database-supabase、supabase-postgres-best-practices。
- `.cursor/README.md` — 目录与 Skills 列表增加两数据库 Skill；Commands 表增加 database-ops。

### 影响

- 写 SQL、设计表、加索引、RLS 或性能优化时，AI 会同时参考 **supabase-postgres-best-practices** 与 **database-supabase**（MCP 操作）。Supabase MCP 仍为本地 Docker HTTP 常驻，无新增 MCP。

---

## 2026-02-16 - 停止使用 Pencil MCP

### 变更内容

项目不再使用 Pencil MCP。页面制作流程改为：设计系统（ui-ux-pro-max）→ 代码实现 → 验证。

### 修改文件

- `.cursor/rules/page-maker.mdc` — 移除 Pencil 先行、Pencil MCP 相关描述
- `.cursor/commands/page-maker.md` — 同上
- `.cursor/agents/page-maker.md` — 同上
- `.cursor/skills/page-maker/SKILL.md` — 同上
- `.cursor/rules/font-lxgw-wenkai.mdc` — 移除 Pencil 设计稿说明
- `.cursor/rules/spec-driven-tdd.mdc` — 更新与 page-maker 的关系描述
- `.cursor/README.md` — 更新 page-maker 描述，从 MCP 列表移除 pencil
- `.cursor/agents/README.md` — 更新 page-maker 描述

### 影响

页面制作工作流不再依赖 Pencil 或 .pen 设计稿，直接按设计系统实现代码并用 browser-tester 验证。

---

## 2026-02-16 - 测试/验证须关注 Docker 状态与日志

### 变更内容

测试或 E2E 验证时若使用 Docker 环境，必须检查容器状态与日志，不得仅凭浏览器或单元测试下结论。

### 修改文件

- `.cursor/commands/run-tests.md` — 新增步骤「Docker 环境检查」：`docker compose ps`、`docker logs Vernify-frontend` 等
- `.cursor/rules/testing-practices.mdc` — E2E 部分补充：必须关注 Docker 状态与日志
- `.cursor/agents/browser-tester.md` — 操作规范补充：先检查 Docker 状态再打开浏览器
- `.cursor/tools-strategy.md` — 新增「Docker 环境验证」小节

### 典型问题

- Vernify-frontend 报 `sh: next: not found`：容器内 next 命令不可用，需检查 Dockerfile/启动命令/volume 挂载

---

## 2026-02-17 - 修复 Vernify-frontend `sh: next: not found`

### 问题

开发环境下 `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` 后，Vernify-frontend 反复重启，日志显示 `sh: next: not found`。

### 根因

1. 匿名卷 `/app/node_modules` 首次启动时为空，覆盖镜像内的 node_modules。
2. 未在容器启动时重新安装依赖，导致 `next` 不可用。

### 修改内容

- **新增** `Web/docker-entrypoint.sh`：启动前检查 `node_modules/.bin/next` 是否存在，若不存在则执行 `npm install`。
- **修改** `Web/Dockerfile.dev`：增加 ENTRYPOINT，在 CMD 前执行 docker-entrypoint.sh。
- **修改** `Web/docker-compose.dev.yml`：将匿名卷改为命名卷 `frontend_node_modules`、`frontend_next`，避免与宿主机 node_modules 冲突或出现不完整安装。

### 影响

Vernify-frontend 容器可正常启动，Next.js dev server 可用。

---

## 2026-02-16 - Context7 写入全部相关文档

### 变更内容

在项目文档中统一明确 **Context7** 的用法与触发条件，确保实现/审查框架 API 时优先查询 Context7。

### 修改文件

- `.cursor/rules/project-structure.mdc` — 新增「框架与库文档查询（Context7）」小节，规定必须优先使用
- `.cursor/tools-strategy.md` — 扩展 Context7：何时用、两步流程（resolve-library-id → query-docs）、本项目常用库表
- `.cursor/SUMMARY.md` — 新增「工具与文档（必用）」：Context7 优先
- `.cursor/rules/spec-driven-tdd.mdc` — 计划阶段：涉及框架/库 API 时先查 Context7
- `.cursor/commands/spec-driven-tdd.md` — 同上
- `.cursor/skills/tdd-plan-and-implement/SKILL.md` — Green 阶段：涉及框架 API 时先查 Context7
- `.cursor/agents/frontend-reviewer.md` — 审查时用 Context7 核对 Next/React 等 API
- `.cursor/agents/test-writer.md` — 编写测试时涉及测试库 API 可查 Context7
- `.cursor/README.md` — MCP 列表中 Context7 注明「必用」及用法

### 影响

AI 在实现或审查涉及 Next.js、React、Supabase、FastAPI、Zod 等 API 时，会优先调用 Context7 获取当前版本文档与示例，减少过时用法。

---

## 2026-02-16 - 新增测试相关配置

### 变更内容

新增测试相关的 Rule、Skill、Subagent 和 Command，完善测试工作流。

### 新增文件

- `.cursor/rules/testing-practices.mdc` — 测试实践规范（单元/集成/E2E 分层、命令、覆盖策略）
- `.cursor/skills/test-coverage-strategy/SKILL.md` — 测试覆盖策略技能（选择测试类型、优先级、缺口分析）
- `.cursor/agents/test-writer.md` — 测试编写专家（编写/补充单元与集成测试）
- `.cursor/commands/run-tests.md` — 运行测试命令（一键运行并汇报）

### 影响

AI 在测试相关任务中可引用 testing-practices 规则、使用 test-coverage-strategy 制定策略、委托 test-writer 编写测试，或通过 `/run-tests` 快速执行测试。

---

## 2026-02-16 - Spec 驱动 TDD 流程优化

### 变更内容

基于 [Superpowers](https://github.com/obra/superpowers)、[Spec Kit](https://github.com/github/spec-kit)、[OpenSpec](https://github.com/Fission-AI/OpenSpec)、[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) 和[模块化编程](https://zh.wikipedia.org/wiki/模块化编程) 理念，对 spec-driven-tdd 相关配置进行优化。

### 修改文件

- `.cursor/rules/spec-driven-tdd.mdc` — 增加核心理念表、规模自适应、模块化思维步骤、Evidence over claims
- `.cursor/skills/spec-driven-analysis/SKILL.md` — 增加 what/why 在 how 之前、澄清阶段、模块边界与依赖
- `.cursor/skills/serena-code-structure/SKILL.md` — 增加模块化思维（高内聚低耦合、接口与实现分离）、模块/接口识别
- `.cursor/skills/tdd-plan-and-implement/SKILL.md` — 增加依赖有序、两阶段验收、任务标注模块/接口
- `.cursor/agents/tdd-executor.md` — 增加两阶段验收、Evidence over claims、模块化边界约束
- `.cursor/commands/spec-driven-tdd.md` — 增加流程概览表、规模自适应、模块化思维、参考链接
- `.cursor/SUMMARY.md` — 更新 Spec 驱动 TDD 流程描述

### 新增理念

- **规模自适应**：简单修复可走快速路径，复杂需求走完整路径
- **模块化思维**：识别模块、接口、依赖；高内聚低耦合；接口与实现分离
- **Evidence over claims**：必须有测试通过证据，不得仅声称完成
- **两阶段验收**：先检查规格符合度，再检查代码质量
- **依赖有序**：任务按模块依赖、接口先后排序

### 影响

AI 在执行 spec-driven-tdd 流程时将更注重规格先行、模块边界和可验证性，提高实现质量与可维护性。

---

## 2026-02-16 12:03 - 代码搜索工具策略

### 变更内容
- 新增代码导航 SubAgent（code-navigator）
- 明确 SemanticSearch vs Serena 的使用场景
- 提供智能工具选择决策流程

### 新增文件
- `.cursor/agents/code-navigator.md`

### 工具选择策略
- **SemanticSearch** - 探索性查询、概念理解、"如何/在哪里/是什么"
- **Serena** - 精确查找符号、查找引用、代码重构

### 影响
AI 现在会根据任务类型智能选择最合适的搜索工具，提高代码导航效率。

---

## 2026-02-16 - 项目配置系统完善

### 变更内容
- 新增项目维护规范 Rule
- 新增项目文档更新 Skill
- 新增项目配置维护 SubAgent

### 新增文件
- `.cursor/rules/project-maintenance.mdc`
- `.cursor/skills/update-project-docs/SKILL.md`
- `.cursor/agents/project-updater.md`

### 影响
AI 现在会自动识别何时需要更新项目配置文档，并系统性地维护所有相关文件。

---

## 2026-02-16 11:32 - 配置本地化迁移

## 删除的全局配置

### Skills
- ✅ `~/.cursor/skills-cursor/` - 5个全局 skills
  - create-rule
  - create-skill
  - create-subagent
  - migrate-to-skills
  - update-cursor-settings

- ✅ `~/.codex/skills/.system/` - 2个系统 skills
  - skill-creator
  - skill-installer

### MCP 配置
- ✅ `~/.cursor/mcp.json` - 全局 MCP 服务器配置（已备份到 `.cursor/mcp.backup.json`）
  
原全局 MCP 包含：
  - serena
  - manim-server
  - mcp-obsidian
  - Context7
  - Playwright
  - pencil

## 最终配置（2026-02-16 11:40 更新）

### 项目级别配置

```
.cursor/
├── rules/
│   └── project-structure.mdc       # 项目结构规范（已更新技术栈）
├── skills/                          # 8个本地 skills
│   ├── ui-ux-pro-max/
│   ├── create-rule/
│   ├── create-skill/
│   ├── create-subagent/
│   ├── skill-creator/
│   ├── skill-installer/
│   ├── update-cursor-settings/
│   └── migrate-to-skills/
├── agents/                          # 5个项目 SubAgents（新增）
│   ├── docker-expert.md
│   ├── latex-expert.md
│   ├── api-tester.md
│   ├── frontend-reviewer.md
│   └── llm-config.md
├── mcp.backup.json                  # 全局 MCP 备份
└── README.md                        # 配置说明
```

### 项目根目录
```
├── .cursorrules                     # 规则快速索引
```

### 全局配置（已恢复）
- `~/.cursor/skills-cursor/` - 5个全局 skills
- `~/.codex/skills/.system/` - 2个系统 skills
- `~/.cursor/mcp.json` - 6个 MCP 服务器

---

## 2026-02-16 - Next.js 16 升级

### 变更内容
- Next.js 14.2.3 → 16.1.6
- React 18 → 19
- 所有依赖升级到最新版本

### 代码修改
- 修复 Zod v4 兼容性（`.error.issues`、`z.record()`）
- 修复 async params（Next.js 16 要求）
- 修复 React 19 类型（ImgHTMLAttributes）
- 移除 SSR document 访问问题

### 配置更新
- `next.config.mjs`: 添加 transpilePackages、turbopack.root
- `globals.css`: @import 移到文件顶部
- `package.json`: 升级所有依赖

---

## 2026-02-16 - Docker 配置完善

### 变更内容
- 新增 PostgREST (supabase-rest) 服务
- 移除 Ollama 服务和所有相关配置
- 修复 Caddy HTTPS 重定向问题

### 配置更新
- `docker-compose.yml`: 添加 supabase-rest
- `supabase/kong.yml`: 添加 REST API 路由
- `backend/app/core/config.py`: 移除 OLLAMA_BASE_URL
- `backend/app/services/llm/`: 移除 Ollama 相关代码
- `caddy/Caddyfile`: 改用 `:80` 端口，禁用自动 HTTPS

---

## 配置策略

### 项目级别（仅 Vernify）
- ✅ **Rules** (2个) - 项目结构和维护规范
- ✅ **Skills** (9个) - 开发工具和工作流
- ✅ **SubAgents** (6个) - 任务专用 AI 代理

### 全局级别（所有项目共享）
- ✅ **MCP** - 协议服务器（Context7、Playwright 等）

## 影响

### 本项目
✅ 使用项目级别 Rules、Skills、SubAgents
✅ 使用全局 MCP 服务器
✅ 配置完全独立且系统化

### 其他项目
✅ 继续使用全局 Skills 和 MCP
✅ 不受本项目配置影响
