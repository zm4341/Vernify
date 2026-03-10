# GitHub 工作流约定

项目已上 GitHub。以下约定与 `.cursor/rules/task-priority-workflow.mdc`、`development-workflow.mdc` 及 finishing-a-development-branch 流程一致。技术栈与协作方式：Vernify 为 Next.js + FastAPI + Supabase + Docker；Cursor/Claude Code 通过 **github** SubAgent 与 **finishing-a-development-branch** 与 GitHub 协作。

## 核心概念（简短）

- **Issue = 任务书/需求文档**：给 AI 的起始坐标——要解决什么问题。写清楚，AI 才能对准目标。
- **PR = 成果验收单/代码差异**：给 AI 的存档点——改了什么、为什么这么改。便于后续复盘与降低 Context 成本。
- **重要**：Issue/PR 不仅是给人看的，更是喂给 AI 的高质量上下文；写烂了 AI 会猜错需求或无法复盘。

## 任务开始前：Issue 先行

- 若有**实际开发、修复或功能任务**（非纯问答），应先**创建或关联 GitHub issue**。
- Issue 应包含：问题/需求描述、验收条件。
- 或确认用户已在 GitHub 创建对应 issue。
- 再执行 Graphiti 检索等后续步骤（见 `task-priority-workflow.mdc`）。

### Issue 怎么写（AI-Friendly）

以下是对 issue **内容与格式**的细化，流程仍以本文件「任务开始前」与 `task-priority-workflow.mdc` 为准。

- **原则**：结构化 > 描述化，给 AI 明确边界。
- **推荐模板**（Markdown）：

```markdown
- **目标 (Goal)**：简短一句（如「修复课程列表页在 Safari 下的白屏」）。
- **当前行为 (Current Behavior)**：现状，可附报错/Log。
- **预期结果 (Expected Result)**：修复后的样子。
- **任务分解 (Tasks)**：可勾选清单，例如：
  - [ ] 检查 xxx 接口
  - [ ] 增加错误捕获
```

- **说明**：在 Cursor 中可 @Issue #123，AI 能抓取上述结构；可说「按 Issue #123 的 Task 1 执行」以精准驱动。

## 解决问题后：提交 PR

- 完成代码/配置变更并**通过验证**后，应：
  - 推送分支到 GitHub；
  - 在 GitHub 创建 **Pull Request**，可关联对应 issue。
- 可与现有 **finishing-a-development-branch** 流程衔接（merge/PR/保留或丢弃分支的决策与步骤）。

### PR 怎么写（Context-Friendly）

以下是对 PR **内容与格式**的细化，流程仍以本文件「解决问题后」与 `task-priority-workflow.mdc` 为准。

- **标题**：采用 **Conventional Commits**（`feat:` / `fix:` / `docs:` / `refactor:` 等）。示例：
  - `feat: 课程列表增加分页`
  - `fix: 修复 Docker 下 Caddy 挂载路径解析`
- **正文建议包含**：
  - **Related Issue**：关联 `#123`（或正文中写 `Fixes #123`，便于自动关 issue）。
  - **What**：做了哪些核心改动。
  - **Why**：为什么用这个方案（避坑/选型理由）。
- **说明**：PR 是给未来自己和 AI 的「记忆碎片」，便于后续复盘与降低 Context 成本。

## 落地建议（简短）

- 仓库内使用 **.github/ISSUE_TEMPLATE** 模板，新建 Issue 时格式即现。
- Cursor/规则可约定：AI 在完成代码变更后，可自动生成或补充 PR 说明，或委托 **github** SubAgent 创建 PR 时带上述结构（Related Issue、What、Why）。

## GitHub 操作与 SubAgent

创建 issue、创建 PR、在 PR 中关联 issue 等 **GitHub 操作**由主 Agent 委托 **github** SubAgent 执行（使用 `gh` CLI）。若用户希望自行操作，可跳过委托，按本文档中的约定在 GitHub 网页或本地 `gh` CLI 完成（如 `gh issue create`、`gh pr create --fill`）。

## 与现有内容的关系

本文中「Issue 怎么写」「PR 怎么写」等小节是对 **issue/PR 内容与格式的细化**；**流程**（任务开始前 Issue 先行、解决问题后提交 PR、委托 github SubAgent）仍以本文件前半与 `task-priority-workflow.mdc` 为准。

## 参考

- `.cursor/rules/task-priority-workflow.mdc` — 任务开始时 GitHub issue 步骤
- `.cursor/rules/development-workflow.mdc` — 可执行清单（任务开始前 / 解决问题后）
- Skill：`finishing-a-development-branch`
