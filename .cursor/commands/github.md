使用 **github** SubAgent 和**官方 GitHub MCP** 完成下面这件事。

（若在 `/github` 后还有文字，则那段文字就是「下面这件事」——例如：`/github 创建 issue：修复登录页白屏`、`/github 创建 PR 关联 #5`、`/github 列出 open issues`。）

## 流程概览

| 步骤 | 内容 | 说明 |
|------|------|------|
| 1 | 理解任务 | 明确要执行的操作：创建 issue、创建 PR、列出 issues/PR、添加评论等 |
| 2 | 委托执行 | 主 Agent 委托 **github** SubAgent，SubAgent 使用 GitHub MCP（issue_write、create_pull_request、list_issues、list_pull_requests、add_issue_comment 等）|
| 3 | 报告 | SubAgent 向主 Agent 回报结果（issue 编号、PR 链接、列表摘要等）|

## 常见任务示例

- **创建 issue**：描述问题/需求与验收条件 → 委托 github 使用 `issue_write`(method: create, owner, repo, title, body)
- **创建 PR**：推送分支后创建 PR、正文含 `Fixes #N` → 委托 github 使用 `create_pull_request`(owner, repo, title, head, base, body)
- **列出 open issues**：委托 github 使用 `list_issues`(owner, repo, state: OPEN)
- **对 issue/PR 评论**：委托 github 使用 `add_issue_comment`(owner, repo, issue_number, body)

若用户未写具体内容，主 Agent 可说明：「请描述要执行的 GitHub 操作（如创建 issue、创建 PR 并关联 #N、列出 open issues），将委托 **github** SubAgent 执行。」

## 参考

- Rule：`.cursor/rules/github-mcp.mdc`
- SubAgent：`.cursor/agents/github.md`
- Skill：`.cursor/skills/github-mcp/SKILL.md`
- `task-priority-workflow.mdc` — 任务前 issue、任务后 PR 步骤
- `docs/GITHUB-MCP.md`、`docs/GITHUB-WORKFLOW.md`

---

现在请开始：把「下面这件事」当作当前任务，委托 **github** SubAgent 使用官方 GitHub MCP 完成；若用户未写具体内容，可提示用户描述要执行的 GitHub 操作（创建 issue、创建 PR 关联 #N、列出 open issues 等）。
