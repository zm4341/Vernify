# Claude Code Agent 模板

Claude Code 通过 **Task 工具**委托子任务。本目录存放各类任务的详细提示模板。

## 与 Cursor SubAgents 的对应关系

| Cursor SubAgent | Claude Code Task | subagent_type |
|---|---|---|
| `graphiti-memory` | `graphiti-memory.md` | `general-purpose` |
| `post-task-reviewer` | `post-task-reviewer.md` | `general-purpose` |
| `code-navigator` | `code-navigator.md` | `Explore` |
| `docs-updater` | 直接使用 Edit/Write 工具 | — |
| `tdd-executor` | 直接执行 bash 命令 | `Bash` |

## 使用方式

在 CLAUDE.md 或对话中，Claude Code 会根据任务类型调用对应模板：

```python
Task(
    subagent_type="general-purpose",
    description="Graphiti 记忆操作",
    prompt="""（使用 .claude/agents/graphiti-memory.md 的内容作为系统上下文）
    任务：检索与 [主题] 相关的记忆，group_id: vernify"""
)
```

## Agent 文件列表

| 文件 | 用途 |
|---|---|
| `graphiti-memory.md` | Graphiti 检索与写入 |
| `post-task-reviewer.md` | 任务完成后的收尾流程 |
| `code-navigator.md` | 代码分析与搜索（无 Serena，用 Explore 代替）|

## 编排原则

与 Cursor 的 `agent-orchestration.mdc` 保持一致：

1. **任务前**：先 Graphiti 检索
2. **委托子任务**：用 Task 工具，保持主上下文清洁
3. **任务后**：写入 Graphiti，必要时更新 docs/
