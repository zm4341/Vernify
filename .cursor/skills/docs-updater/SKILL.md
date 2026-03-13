---
name: docs-updater
description: 项目文档更新工作流。根据 Serena 分析、架构变更、代码重构，系统性地更新 docs/ 等，确保与实现一致。
---

# Docs Updater 技能

根据 Serena 分析、架构决策、代码变更，系统性地更新 Vernify 项目文档。**主 Agent 不得自行修改文档，须委托 docs-updater SubAgent 或使用本技能流程。**

**文档存放原则**：所有文档类文件均放在根目录 docs/ 下，docs/ 为唯一文档根。创建文件前必查 docs/、Graphiti、必要时 Serena。详见 `docs/DOCUMENT-CONVENTIONS.md`。

## 何时使用

- Serena / code-navigator 分析完成后，需修正架构文档
- 架构、路由、环境变量、模块边界变更
- 代码重构、目录结构、API 端点变化
- 功能/迁移变更、技术栈升级

## 维护的文档

| 类别 | 路径 |
|------|------|
| 架构 | `docs/architecture/`（ARCHITECTURE.md 唯一；TECH-STACK-ANALYSIS.md、PRD.md、MODULARIZATION.md） |
| 迁移 | `docs/migration/` |
| 其他 | `docs/latex/`、`docs/auth/`、`docs/plans/` 等 |
| 变更记录 | `.cursor/MIGRATION.md`（文档/架构类） |

**统一做法**：修改即替换（用新内容替换原文，不保留 v1/v2/_old）；不创建重复文档（主要宗旨；确需新建须非常严谨：创建前必查、必要性分析、记录新建原因）；单一数据源（与 graphiti-memory 的 8 个规范文件一致）。

## 执行流程

### 1. 接收变更来源

- Serena 分析报告
- 架构决策、代码 diff、功能变更说明

### 2. 阅读现有文档

- 识别需修改的文件与段落
- 理解当前描述，避免与既有内容冲突

### 3. 按事实更新

- 以代码、Serena 分析、架构决策为准
- 修正不一致处，移除过时内容
- 遵循 refactor-convention：简化、主干、不堆叠

### 4. 一致性检查

- 不同文档间描述一致
- 与 project-structure.mdc、规范文件对齐
- 与 graphiti-memory 的 8 个规范文件一致

### 5. 记录与同步

- 重大变更写入 `.cursor/MIGRATION.md`
- 委托 graphiti-memory 写入本次文档更新摘要
- 若文档为 Graphiti 规范文件，需保证 Graphiti 可据此整体重构记忆

## 与 project-updater 分工

- **docs-updater**：docs/（含 docs/architecture/ARCHITECTURE.md 等业务与架构文档）
- **project-updater**：.cursor/ 配置（Rules、Agents、Skills、Commands）

## 与 post-task-workflow 配合

post-task 流程中「更新文档」步骤：若变更涉及 docs/ 或架构，委托 docs-updater；若仅涉及 .cursor/ 配置，委托 project-updater。

## 参考

- Rule：`docs-updater.mdc`
- SubAgent：`docs-updater`
- Command：`/update-docs`
- 开发流程（任务结束更新文档时机）：`task-priority-workflow.mdc`、`docs/CLAUDE-CURSOR-COLLABORATION.md`
