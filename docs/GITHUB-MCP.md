# Vernify 项目 GitHub MCP 配置

Vernify 使用**官方 GitHub MCP**（[ghcr.io/github/github-mcp-server](https://github.com/github/github-mcp-server)）进行 issue、Pull Request、评论等操作。用户已关闭 GitKraken MCP，仅使用官方 GitHub MCP。

## 配置位置

- **Cursor**：`.cursor/mcp.json` 中键 `"github"`，对应镜像 `ghcr.io/github/github-mcp-server`（通过 Docker 运行，需 `GITHUB_PERSONAL_ACCESS_TOKEN` 等环境变量）。
- 主 Agent **不直接**调用 gh CLI 完成 GitHub 流程，而是委托 **github** SubAgent 使用 GitHub MCP。

## 主 Agent 与 github SubAgent

- **SubAgent 定义**：`.cursor/agents/github.md`  
  github SubAgent 负责执行 issue 创建/更新、PR 创建、列出 issue/PR、添加评论等；必须使用 GitHub MCP 工具（如 `issue_write`、`create_pull_request`、`add_issue_comment`、`list_issues`、`list_pull_requests`），调用前须查看 MCP 工具 schema 确认参数。
- **Rule**：`.cursor/rules/github-mcp.mdc`  
  规定何时委托 github SubAgent、优先使用 GitHub MCP、与 task-priority-workflow 的 issue/PR 步骤一致。
- **Skill**：`.cursor/skills/github-mcp/SKILL.md`  
  工具与参数要点、owner/repo 等约定。
- **Command**：`.cursor/commands/github.md`  
  可通过 `/github` 触发「创建 issue」「创建 PR 关联 #N」「列出 open issues」等，由主 Agent 委托 github SubAgent 执行。

## 仓库标识（owner / repo）

创建 issue、PR 时使用项目实际仓库。例如 Vernify 仓库为 **zm4341/Vernify**，则：

- **owner**：`zm4341`
- **repo**：`Vernify`

可从 `git remote -v` 或本文档获取；若仓库迁移，需同步更新本文档与 SubAgent/Skill 中的默认说明。

## 与工作流的关系

- **任务开始前（开发/修复/功能任务）**：创建或关联 issue 时，主 Agent 委托 **github** SubAgent；创建 issue 后立即切出 feat/fix/docs/refactor 分支。见 `task-priority-workflow.mdc`、`docs/GITHUB-WORKFLOW.md`。
- **任务结束后（有代码/配置变更）**：创建 PR 并关联 `Fixes #N` 时，主 Agent 委托 **github** SubAgent；**PR 创建后等待用户确认**，AI 不得自行 merge 或删除分支。

## 参考

- `docs/GITHUB-WORKFLOW.md` — Issue/PR 内容与格式、流程约定；其中「GitHub MCP 与 github SubAgent」一节与本文档一致
- `.cursor/agents/github.md` — github SubAgent 完整说明
- `.cursor/rules/github-mcp.mdc` — GitHub MCP 规则与委托时机
