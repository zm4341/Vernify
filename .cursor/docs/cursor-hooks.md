# Cursor Hooks 说明

Vernify 已启用 **Cursor Hooks**（[官方文档](https://cursor.com/docs/agent/hooks)），在 Agent 生命周期特定节点自动执行脚本。

## 配置位置

`.cursor/hooks.json`：

```json
{
  "version": 1,
  "hooks": {
    "beforeSubmitPrompt": [{ "command": "hooks/session-init.sh" }],
    "afterFileEdit": [{ "command": "hooks/format.sh" }]
  }
}
```

命令路径相对于 `.cursor/` 目录（`hooks.json` 所在目录）。

## 已配置 Hooks

### beforeSubmitPrompt（任务开始提醒）

- **脚本**：`.cursor/hooks/session-init.sh`
- **触发时机**：用户提交 prompt 时（Agent 尚未开始执行）
- **用途**：注入 Vernify 任务开始必做提醒（`additional_context`）
- **内容**：先委托 graphiti-memory 检索；涉及代码分析时委托 code-navigator(Serena)；上下文不足时读 docs、.cursor Rules。主 Agent 只沟通与委托，不直接操作。
- **说明**：Cursor 当前版本可能暂不解析 `additional_context` 输出，脚本仍会执行；若 Cursor 支持则自动注入上下文。

> **注意**：Cursor 目前**不支持** `sessionStart` 钩子，故使用 `beforeSubmitPrompt` 作为替代（每次提交 prompt 时触发，类似任务开始）。

### afterFileEdit（文件编辑后格式化）

- **脚本**：`.cursor/hooks/format.sh`
- **触发时机**：Agent 编辑完文件后
- **用途**：对修改过的文件运行 `npx prettier --write`（若 prettier 可用）
- **支持扩展**：`.ts`、`.tsx`、`.js`、`.jsx`、`.json`、`.md`、`.mdc`、`.css`、`.html`
- **失败处理**：若 prettier 不可用或格式化失败，脚本 exit 0，不阻断 Agent 流程

## 输入 / 输出 Schema

### beforeSubmitPrompt 输入（stdin）

```json
{
  "conversation_id": "...",
  "generation_id": "...",
  "prompt": "...",
  "attachments": [],
  "hook_event_name": "beforeSubmitPrompt",
  "workspace_roots": ["/path/to/project"]
}
```

### afterFileEdit 输入（stdin）

```json
{
  "conversation_id": "...",
  "generation_id": "...",
  "file_path": "Web/app/page.tsx",
  "edits": [{ "old_string": "...", "new_string": "..." }],
  "hook_event_name": "afterFileEdit",
  "workspace_roots": ["/path/to/project"]
}
```

### session-init.sh 输出（stdout，可选）

```json
{
  "additional_context": "Vernify 任务开始必做：..."
}
```

## 与 Superpowers Hooks 的区别

| 项目       | Superpowers Hooks        | Cursor Hooks                |
|------------|--------------------------|-----------------------------|
| 配置位置   | `hooks/hooks.json`       | `.cursor/hooks.json`        |
| 触发事件   | SessionStart（会话启动） | beforeSubmitPrompt、afterFileEdit 等 |
| 运行环境   | Claude 插件              | Cursor 内置                 |
| Vernify 使用 | 未安装                   | 已启用（本配置）            |

详见 `.cursor/docs/superpowers-hooks.md`。

## 与 Claude Code hookify 插件对照

Claude Code 侧已安装 **hookify**（[claude-plugins-official](https://github.com/anthropics/claude-plugins-official)），通过 `.local.md` 配置 PreToolUse/PostToolUse/UserPromptSubmit/Stop。Cursor 无插件体系，用本配置实现类似「行为守卫」：

| hookify 事件 | Cursor 对应 | 说明 |
|---------------|-------------|------|
| **UserPromptSubmit** | **beforeSubmitPrompt** | ✅ 已实现：`session-init.sh` 注入任务开始必做（Graphiti 优先、委托优先） |
| **PostToolUse**（工具调用后） | **afterFileEdit** | ✅ 部分实现：仅覆盖「编辑文件」后执行 `format.sh`；无通用「每次工具后」钩子 |
| **PreToolUse**（工具调用前） | 无 | 若 Cursor 后续支持「工具执行前」事件可补；当前靠 Rule（如 `agent-orchestration.mdc`、`browser-debug.mdc`）约束 |
| **Stop**（会话结束） | 无 | 无会话结束钩子；任务结束后由 **post-task-workflow** Rule + `/post-task-review` 等补（写 Graphiti、更新文档） |

结论：提交前提醒与改文件后格式化已在 Cursor 覆盖；更细粒度的 PreToolUse/Stop 依赖 Rule 与流程，或等 Cursor 支持更多事件后再加脚本。

## 脚本可执行权限

若脚本无法执行，可运行：

```bash
chmod +x .cursor/hooks/session-init.sh .cursor/hooks/format.sh
```

## 调试

Cursor 提供 Hooks 输出通道：Output → Hooks，可查看脚本执行与 JSON 解析情况。
