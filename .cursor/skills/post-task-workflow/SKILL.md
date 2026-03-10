---
name: post-task-workflow
description: 任务完成后的必做流程——Graphiti 检查已做事项 → Serena 分析架构并重构 → 更新文档 → 同步 Rules/Skills/SubAgents/Commands → Graphiti 记录。
---

# 任务完成后必做流程

完成任何有实际变更或得出结论的任务后（含查询类任务），必须执行本技能描述的两条流程。**最高优先级，自动化**，无需用户提醒。参考 Rule：`post-task-workflow.mdc`、`task-priority-workflow.mdc`。

## 交付前验证（必做）

- 交付前必须确保**构建通过**（如 `cd Web && npm run build` 或等效）、**已知错误已修复**（Lint、类型、测试等）。
- 主 Agent 与 SubAgent 应**自动修复**构建错误和已知错误，直接交付可用结果，不把未修复问题留给用户。
- 禁止交付带构建失败或已知 bug 的结果；若无法全部修完，须在汇报中明确剩余问题与建议。

## 流程一：变更检查与重构

### 1. Graphiti 检查

- **目的**：确认本次任务相关的既有记录、已做事项、上下文
- **工具**：Graphiti MCP
  - `search_nodes`：检索与当前任务相关的 Preference、Procedure、Fact
  - `search_memory_facts`：检索相关事实与关系
- **产出**：了解历史上下文，避免重复或冲突

### 2. Serena 分析

- **目的**：分析相关代码的符号结构、依赖、引用，识别架构问题
- **工具**：Serena MCP（参考 `serena-code-structure`）
  - `get_symbols_overview`：符号概览
  - `find_symbol`：精确符号定位
  - `find_referencing_symbols`：谁在引用
  - `list_dir`：目录结构
- **产出**：模块边界、接口、依赖方向、可重构点

### 3. 重构

- **原则**：遵循 `refactor-convention.mdc`——**简化结构、突出主干、移除冗余**，不通过添加补充节点堆叠信息；高内聚低耦合、接口与实现分离
- **范围**：根据 Serena 分析，对明显问题做**精简式**重构
- **工具**：Serena 的 `replace_content`、`rename_symbol` 等（若适用）

### 4. 更新文档

- 委托 **docs-updater** 更新 `docs/`（含 docs/architecture/ARCHITECTURE.md）等架构/业务文档
- 委托 **project-updater** 更新 .cursor/ 配置（Rules、SubAgents、Skills、Commands）
- `.cursor/MIGRATION.md` 由执行者记录重大变更

### 5. Graphiti 记录

- 用 `add_memory` 记录（本 MCP 无 add_episode）：
  - 本次完成的事项
  - 关键结果
  - 架构/设计相关结论
- **记录时按文档整体重构记忆**：根据所有 Vernify 文档修正错误记忆、使全部记忆与文档一致，不只追加；若既有记忆与当前事实不符，先用 `delete_entity_edge` / `delete_episode` 删除错误记忆再写入。
- 可复用步骤记为 **Procedure**，重要结论记为 **Fact**

## 流程二：知识同步

### 1. 更新配置

根据变更类型，更新以下一项或多项：

| 变更类型 | 需更新 |
|----------|--------|
| 技术栈/架构 | Rules（project-structure、project-maintenance）、SubAgents |
| 开发流程 | Rules（spec-driven-tdd 等）、Skills、Commands |
| 新增功能/服务 | SubAgents（如 docker-expert、api-tester）、Skills |
| 通用流程/约定 | Rules、Skills、SubAgents、Commands 中相关描述 |

### 2. 记录

- 在 `.cursor/MIGRATION.md` 中记录配置变更（若重大）
- 用 Graphiti 写入本次配置/规则更新，便于后续检索

## 何时使用

- 完成任何有代码/配置/文档变更的任务后
- 可主动执行，或由用户运行 `/post-task-review` 触发
- 复杂情况可委托 **post-task-reviewer** SubAgent

## 与 Rule / SubAgent / Command 的配合

- 规则：`post-task-workflow.mdc`；重构约定：`refactor-convention.mdc`
- SubAgent：`post-task-reviewer`
- Command：`/post-task-review`
