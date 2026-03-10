---
name: finishing-a-development-branch
description: 实现完成、测试通过后，引导 merge/PR/保留/丢弃分支的决策。参考 Superpowers finishing-a-development-branch。
---

# Finishing a Development Branch（完成开发分支）

## 核心理念

验证测试 → 呈现选项 → 执行选择 → 清理。

## 流程

### 1. 验证测试

在呈现任何选项前，**必须**运行测试套件确认通过。

若失败：停止，展示失败信息，不进入步骤 2。

### 2. 呈现选项

向用户提供 4 种选择：

```
实现完成。你想怎么做？

1. 合并到 <base-branch>（本地）
2. 推送并创建 Pull Request
3. 保留分支（稍后自行处理）
4. 丢弃本次工作

请选择？
```

### 3. 执行选择

- **1**：`git checkout <base> && git merge <feature>`，验证合并后测试，清理
- **2**：`git push`，创建 PR
- **3**：保留，不清理
- **4**：确认后 `git branch -D`，清理 worktree（若在 worktree 中）

### 4. 若使用 Git Worktree

若在 `git worktree` 中开发，选项 1 或 4 后需 `git worktree remove` 清理。

## 何时使用

- 所有 TDD 任务完成、测试全绿后
- 用户准备合并或提交 PR 时

## 与 Vernify 流程的配合

- **tdd-executor** 全部完成后，主 Agent 可调用本技能
- **post-task-reviewer** 执行任务收尾（Graphiti/Serena/文档）后，若涉及分支完成，可引导用户选择上述选项
- **Vernify 约定**：主流程在**创建 PR 后即停止**；**merge 与删除分支须等用户确认后**再由用户执行（或用户明确指令后执行）。AI 不得自行 merge 或删分支。本技能用于用户确认后引导选项 1～4

## 来源

来自 [Superpowers](https://github.com/obra/superpowers) finishing-a-development-branch。
