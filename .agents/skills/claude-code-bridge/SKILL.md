---
name: claude-code-bridge
description: Claude Code 与 Cursor 协作桥梁技能。当需要在两个工具之间切换、委托任务或同步上下文时使用。通过 Graphiti 共享记忆实现跨工具协作。
---

# Claude Code × Cursor 协作桥梁

本技能定义 Claude Code 与 Cursor 之间的**任务委托与上下文同步**协议。两者通过 **Graphiti（group_id: vernify）** 共享记忆，实现无缝协作。

## 分工矩阵

| 任务类型 | 推荐工具 | 理由 |
|---|---|---|
| Git 操作（commit、branch、merge、rebase）| **Claude Code** | 更强的 bash 执行能力 |
| 构建 & 测试（npm build、pytest）| **Claude Code** | 命令行执行能力 |
| 文件系统整理（批量重命名、目录重构）| **Claude Code** | 文件操作工具 |
| 长时自动化任务（批处理、脚本）| **Claude Code** | 不受 UI 交互限制 |
| 代码编辑（精确修改、重构）| **Cursor** | Serena MCP、IntelliSense |
| 页面/UI 制作与调整 | **Cursor** | page-maker + Pencil + 视觉验证 |
| 浏览器测试（Chrome DevTools MCP）| **Cursor** | browser-tester SubAgent |
| Serena 代码分析 | **Cursor** | Serena MCP 专属 |
| 交互式调试 | **Cursor** | 实时代码编辑体验 |
| Graphiti 记忆操作 | **两者均可** | 共享 MCP，group_id: vernify |
| Supabase 数据库操作 | **两者均可** | 共享 MCP |

## 从 Cursor 委托任务给 Claude Code

当 Cursor 遇到以下场景时，切换到 Claude Code CLI 处理：

### 场景 1：git 操作
```
# 在 Cursor 中用 Graphiti 记录上下文
add_episode(name="任务上下文", episode_body="需要 Claude Code 执行: git rebase...")

# 在 Claude Code 中读取上下文并执行
search_facts(query="git rebase 任务", group_ids=["vernify"])
```

### 场景 2：构建修复
```
# Cursor 写入
add_episode(name="构建失败", episode_body="npm run build 报错: [错误详情]")

# Claude Code 处理
search_nodes(query="构建失败", group_ids=["vernify"])
# 然后: cd Web && npm run build，分析错误，修复
```

### 场景 3：长时自动化
```
# Cursor 将任务规格写入 Graphiti
add_memory(name="自动化任务规格", content="...", category="Procedure")

# Claude Code 读取执行
search_nodes(query="自动化任务规格", group_ids=["vernify"])
```

## 从 Claude Code 委托任务给 Cursor

当 Claude Code 完成 CLI 操作后，需要 Cursor 继续处理：

### 场景：分析后需要代码编辑
```python
# Claude Code 分析完成，写入 Graphiti
add_episode(
    name="代码分析结果",
    episode_body="分析结论：需要修改 Web/app/api/v1/grading.ts 中的 grade() 函数...",
    group_id="vernify"
)
# 告知用户：切换到 Cursor 让 frontend-reviewer 或 code-navigator 处理
```

## 上下文交接格式

通过 Graphiti 交接任务时，`add_episode` 内容建议包含：

```
任务类型: [git/build/code-edit/analysis/...]
当前状态: [已完成/进行中/待处理]
关键信息: [文件路径、错误信息、变更内容等]
下一步行动: [需要对方工具执行的具体操作]
```

## Graphiti 共享记忆协议

```
group_id: vernify（两个工具必须一致）

Cursor 写入 → Claude Code 可读
Claude Code 写入 → Cursor 可读

两者共享：
- Preference（偏好）
- Procedure（流程约定）
- Requirement（需求）
- Fact（事实）
- Episode（任务摘要）
```

## Cursor 命令

在 Cursor 中，可运行 `/use-claude-code` 命令触发 Claude Code 协作流程。

## 参考

- `CLAUDE.md` — Claude Code 项目配置
- `.cursor/rules/agent-orchestration.mdc` — Cursor SubAgent 分工
- `docs/GRAPHITI-USAGE.md` — Graphiti 使用约定
- `.claude/agents/` — Claude Code Agent 模板
