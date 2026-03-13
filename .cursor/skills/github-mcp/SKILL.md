# GitHub MCP 技能

使用**官方 GitHub MCP**（ghcr.io/github/github-mcp-server）执行 issue、Pull Request、评论等操作。主 Agent 委托 **github** SubAgent 时，本 SubAgent 按本技能选用工具与参数。

## 何时使用

- 创建 issue（任务开始前，开发/修复/功能任务时）
- 创建 PR 并关联 issue（任务结束后，正文写 `Fixes #N`）
- 列出 open/closed issues 或 PR
- 对 issue 或 PR 添加评论

详见 `.cursor/agents/github.md` 与 `.cursor/rules/github-mcp.mdc`。

## 主要工具与参数要点

调用前须查看 MCP 工具 schema 确认最新参数（Cursor 内 MCP 服务器名为 `github`）。

| 工具 | 用途 | 必填参数示例 | 可选 |
|------|------|--------------|------|
| `issue_write` | 创建/更新 issue | method, owner, repo；创建时加 title | body, labels, assignees, state |
| `create_pull_request` | 创建 PR | owner, repo, title, head, base | body（可含 Fixes #N）, draft |
| `add_issue_comment` | 评论 issue/PR | owner, repo, issue_number, body | — |
| `list_issues` | 列 issue | owner, repo | state (OPEN/CLOSED), labels, perPage |
| `list_pull_requests` | 列 PR | owner, repo | state (open/closed/all), base, perPage |

- **owner / repo**：项目仓库，如 Vernify 为 owner: `zm4341`, repo: `Vernify`；可从 git remote 或 `docs/GITHUB-MCP.md` 获取。
- **head / base**：创建 PR 时 head=当前功能分支，base=目标分支（通常 `main`）。

## 原则

- 不自行 merge PR、不删分支；PR 创建后等用户确认。
- 优先使用 GitHub MCP，不依赖 gh CLI。

## 参考

- `.cursor/agents/github.md` — SubAgent 定义与工作流程
- `.cursor/rules/github-mcp.mdc` — Rule 与委托时机
- MCP 工具 schema：Cursor 内 `github` 服务器对应工具描述（如 issue_write、create_pull_request 等）
