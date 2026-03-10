# /orchestrate — 多 SubAgent 编排

按预定义工作流链式调用多个专用 SubAgent。**7 阶段详细说明**见 [docs/orchestrate-workflow.md](../../docs/orchestrate-workflow.md)（与 Claude Code 统一引用）。

## 用法

```
/orchestrate feature     — 完整功能开发（7阶段）
/orchestrate bugfix      — Bug 修复
/orchestrate refactor    — 重构
/orchestrate security    — 安全审查
/orchestrate code-review — 仅代码 Review
```

---

## feature — 7 阶段工作流

> 参考 Anthropic 官方 `feature-dev` 插件，融合 Vernify 特有上下文（Graphiti / Docker / Supabase）。

### Phase 1：Discovery（需求发现）

1. 若需求不清晰，询问用户（问题、约束、影响模块）
2. 检索 Graphiti 相关记忆
3. 总结理解并确认

### Phase 2：Codebase Exploration（代码库探索）

1. 并行启动 2–3 个 **code-explorer** SubAgents，各关注不同视角
2. 读取 agent 返回的关键文件（5–10 个）
3. 呈现探索摘要

### Phase 3：Clarifying Questions（澄清问题）

⚠️ **此阶段不可跳过。**

梳理未明确的边界情况、错误处理、Supabase schema 变更、n8n workflow 触发等，**等待用户回答**。

### Phase 4：Architecture Design（架构设计）

1. 并行启动 2–3 个 **code-architect** SubAgents（最小变更 / 清洁架构 / 实用平衡）
2. 汇总方案，给出推荐
3. **等待用户选择**

### Phase 5：Implementation（实现）

⚠️ **等待用户明确批准后才开始编码。**

- 页面/UI 修改由 Cursor 直接处理（不需委托）
- 复杂后端逻辑、git 操作可通过 `/use-claude-code` 委托 Claude Code

### Phase 6：Quality Review（质量审查）

1. 并行启动 3 个 **code-reviewer** SubAgents（简洁性 / Bug / 规范）
2. 汇总，**置信度 < 80% 过滤掉**
3. 向用户呈现清单，询问处理方式

### Phase 7：Summary（总结 + 记忆）

1. 总结构建内容、关键决策、修改文件
2. 写入 Graphiti 记忆
3. 若有架构变更，更新 `docs/architecture/ARCHITECTURE.md`

---

## 其他工作流

| 工作流 | 链路 |
| -------- | ------ |
| `bugfix` | Discovery → code-explorer → 实现 → 3×code-reviewer → /verify |
| `refactor` | architect → [确认] → code-reviewer → tdd-executor → /verify |
| `security` | security-reviewer → code-reviewer → 报告 |
| `code-review` | 3×code-reviewer 并行 → 置信度过滤 → 汇总 |

## 交接文档格式

每个 SubAgent 完成后输出：

```markdown
## Handoff: [当前] → [下一个]
**Context**: 任务背景
**Findings**: 发现/决策
**Files Modified**: 修改文件
**Status**: SHIP / NEEDS WORK / BLOCKED
```

## 与 Claude Code 协作

复杂编排任务（git、构建、长时自动化）可通过 `/use-claude-code` 委托 Claude Code 执行。
