---
name: graphiti-memory
description: 使用 Graphiti MCP 操作 Vernify 项目的共享长期记忆（group_id: vernify）。Claude Code 与 Cursor 共用同一图谱。任务前检索、任务后写入。
---

# Graphiti 长期记忆技能

在 Vernify 项目中，**Graphiti 是 Claude Code 与 Cursor 共享的记忆系统**（Neo4j 知识图谱）。两个工具使用同一个 `group_id: vernify` 知识图谱，互相可读对方写入的记忆。

## ⚠️ 硬性要求

- **任务前**：必须先用 Graphiti 检索，不得跳过
- **任务后**：必须写入任务摘要，不得遗漏

## 配置

| 项 | 值 |
|---|---|
| MCP endpoint | `http://localhost:19283/mcp/` |
| group_id | `vernify`（必须，与 Cursor 完全一致）|
| 后端 | Neo4j |

> 禁止使用 `vernify-project`（已删除）。

## 工具

| 工具 | 用途 |
|---|---|
| `search_nodes` | 检索节点（按实体类型：Preference、Procedure、Requirement 等）|
| `search_facts` | 检索事实与关系 |
| `add_episode` | 写入事件/任务摘要 |
| `add_memory` | 写入偏好、程序、事实 |
| `delete_entity_edge` | 删除错误事实 |
| `delete_episode` | 删除错误事件 |

## 执行流程

### 任务前：先检索

```
1. search_nodes(query="<任务关键词>", group_ids=["vernify"])
   - 过滤类型：Preference、Procedure、Requirement
2. search_facts(query="<任务关键词>", group_ids=["vernify"])
3. 审查结果，遵循检索到的偏好与程序执行
```

### 任务后：整体重构记忆

```
1. 检索相关既有记忆
2. 发现错误/过时记忆：先 delete_entity_edge 或 delete_episode 删除
3. 写入正确内容：add_episode（任务摘要）或 add_memory（偏好/程序/事实）
4. 不得仅追加，必须整体重构
```

## 写入规范

### 记忆来源（唯一依据）

写入 Graphiti 的内容仅可来自以下规范文件：

1. `.cursor/rules/project-structure.mdc`
2. `docs/architecture/ARCHITECTURE.md`
3. `docs/architecture/TECH-STACK-ANALYSIS.md`
4. `docs/architecture/PRD.md`
5. `docs/architecture/MODULARIZATION.md`
6. `docs/migration/CONTENT-SOURCE-MIGRATION.md`
7. `.cursor/rules/refactor-convention.mdc`
8. `.cursor/rules/agent-orchestration.mdc`

### 实体类型

| 类型 | 用途 |
|---|---|
| Preference | 用户偏好（技术栈选择、风格偏好等）|
| Procedure | 做某类事的步骤或约定 |
| Requirement | 需求与约束 |
| Fact | 实体间关系 |
| Episode | 任务摘要、事件记录 |

## 与 Cursor 的协作

- **Cursor 写入的记忆** Claude Code 可直接读取（同一 group_id）
- **Claude Code 写入的记忆** Cursor 可直接读取
- 这是 Claude Code × Cursor 协作的核心机制

## 参考

- `docs/GRAPHITI-USAGE.md` — Vernify Graphiti 使用约定
- `.cursor/rules/graphiti-memory.mdc` — Cursor 侧的详细规范
- `.cursor/agents/graphiti-memory.md` — Cursor 的 graphiti-memory SubAgent
- [Graphiti MCP README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)
