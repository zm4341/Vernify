将当前任务委托给 **Claude Code CLI** 处理，通过 Graphiti 同步上下文。

（若在 `/use-claude-code` 后有文字，则那段文字即「要委托的任务」——例如：`/use-claude-code 执行 git rebase 并整理提交历史` 表示把该任务交给 Claude Code 处理。）

## 适合委托给 Claude Code 的任务类型

| 任务 | 原因 |
|---|---|
| Git 操作（commit、rebase、cherry-pick、tag）| Claude Code bash 执行能力更强 |
| 构建修复（`npm run build` 错误）| 命令行调试更高效 |
| 测试运行与修复（`pytest`、`npm test`）| 批量命令执行 |
| 文件系统整理（批量重命名、目录重构）| 文件操作工具 |
| 长时自动化（批处理、脚本编写）| 不受 UI 交互限制 |
| 跨工具协作任务编排 | Claude Code 可调度 bash + MCP |

## 上下文交接流程（通过 Graphiti）

**步骤 1**：Cursor 将任务上下文写入 Graphiti

```
委托 graphiti-memory 执行：
add_memory(
    name="Claude Code 任务委托",
    episode_body="任务：[具体任务描述]
    当前状态：[已完成/进行中的背景]
    相关文件：[关键文件路径]
    期望结果：[预期输出]",
    group_id="vernify",
    source="text"
)
（本 MCP 无 add_episode，使用 add_memory。）
```

**步骤 2**：通知用户切换到 Claude Code

向用户提示：
> 「此任务已写入 Graphiti（group_id: vernify）。请在 Claude Code（终端）中运行，它会自动检索上下文并执行。」

**步骤 3**：Claude Code 在任务开始时自动检索

Claude Code 的 `CLAUDE.md` 要求任务前必做 Graphiti 检索，会自动读取上下文。

## 结果同步

Claude Code 完成任务后，会自动写入 Graphiti。Cursor 可用以下命令获取结果：

```
/graphiti-memory 检索最近的 Claude Code 任务结果
```

## 不适合委托给 Claude Code 的任务

- 页面/UI 制作（需要 Pencil、browser-tester）→ 用 `/page-maker`
- Serena 代码分析（Cursor 专属）→ 用 code-navigator
- Chrome DevTools 调试（Cursor 专属）→ 用 browser-tester

## 参考

- `.agents/skills/claude-code-bridge/SKILL.md` — 完整协作协议
- `CLAUDE.md` — Claude Code 项目配置
- `.claude/agents/` — Claude Code Agent 模板
- `docs/GRAPHITI-USAGE.md` — Graphiti 使用约定

---

请按用户意图将「要委托的任务」的上下文写入 Graphiti，并提示用户在 Claude Code 中处理。
