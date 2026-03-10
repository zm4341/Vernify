# Superpowers Hooks 说明

## Hooks 是什么

Superpowers 的 **Hooks** 是 Cursor/Claude 插件的**生命周期钩子**，在特定事件（如会话启动、恢复）时自动执行脚本。

## 配置方式

`hooks/hooks.json` 定义事件与要执行的命令，例如：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- **SessionStart**：会话启动或恢复时触发
- **matcher**：匹配「startup」「resume」「clear」「compact」等场景
- **session-start.sh**：通常用于初始化环境、加载上下文、设置工作目录等

## 我们有必要安装吗？

**Vernify 当前不需要安装 Superpowers 的 Hooks。**

原因：

1. **SessionStart 的典型用途**：Superpowers 的 `session-start.sh` 主要用于在 Claude Code 中做环境初始化（如检查工作目录、加载项目上下文）。Vernify 使用 Cursor，项目配置已在 `.cursor/` 中，无额外初始化需求。

2. **独立配置 vs 整包**：Vernify 采用「摘取式」集成（只取 systematic-debugging、verification-before-completion、finishing-a-development-branch 等技能与理念），未安装 Superpowers 整包。Hooks 依赖插件根目录和 `session-start.sh` 等脚本，单独启用 Hooks 需要复制脚本并适配路径，收益有限。

3. **何时考虑**：若将来需要「每次会话启动自动执行某脚本」（如同步配置、预加载上下文），可参考 Superpowers 的 hooks 结构自行实现，或安装整包后再评估。

## 结论

- **Hooks 用途**：在会话启动/恢复时自动运行脚本（环境初始化、上下文加载等）
- **Vernify**：不安装 Superpowers Hooks；已有 Rules、Skills、SubAgents 覆盖工作流

## 与 Cursor Hooks 的关系

Vernify 已启用 **Cursor 原生 Hooks**（`.cursor/hooks.json`），使用 `beforeSubmitPrompt` 和 `afterFileEdit` 实现任务开始提醒和文件编辑后格式化。详见 `.cursor/docs/cursor-hooks.md`。
