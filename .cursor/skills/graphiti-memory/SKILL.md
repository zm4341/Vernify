---
name: graphiti-memory
description: 使用 Graphiti MCP 进行长期记忆的存储与检索；Graphiti 既是记忆系统，也用于记录做过的事。任务前搜索、任务后写入 Neo4j。
---

# Graphiti 长期记忆技能

在 Vernify 项目中，使用 **Graphiti MCP** 构建 AI 的长期记忆（Neo4j 知识图谱）。Graphiti 既是**记忆系统**（偏好/程序/需求/事实/事件），也用于**记录做过的事**（任务摘要、变更、结论），供后续检索与一致执行。

**⚠️ 硬性要求**：每次任务开始**必须**先用 Graphiti 检索，**不得跳过**；做事后必写入。主 Agent 在做任何事之前必须先执行 Graphiti 检索。

## group_id 约定（必遵）

- **统一使用** `group_id: vernify`（或 `group_ids: ["vernify"]`）
- **不使用** `vernify-project`；该组已删除，全部记忆写入 `vernify` 组

## 何时使用

- 开始新任务前：检索是否已有相关偏好、程序或事实
- 用户表达需求/偏好时：立即用 `add_memory` 存储
- 发现「用户希望如何做某类事」时：记录为 Procedure
- 完成一次任务后：用 `add_memory(name=..., episode_body=..., group_id="vernify", source="text")` 将本次完成的事项写入，便于后续检索与一致行为
- 需要围绕某节点探索关联信息时：使用 `center_node_uuid` 做定向搜索

## 工具声明：Graphiti MCP

本技能**依赖 Graphiti MCP**，常用工具包括：

| 工具 | 用途 |
|------|------|
| `search_nodes` | 按实体类型（Preference / Procedure / **Requirement** 等）检索节点 |
| `search_memory_facts` | 检索事实与关系（外部文档中的 `search_facts` 在 Vernify 中即此工具） |
| `add_memory` | 添加 episode（任务摘要、Procedure、Fact 等）；**必填** name + **episode_body**，可选 group_id、source；无 content/category 参数。详见 `docs/GRAPHITI-MCP-REFERENCE.md` |

（本 MCP 无单独 add_episode；Cursor 内服务器名为 user-graphiti。实际工具名以 Cursor MCP 列表为准。）

## 执行流程

### 0. 可选：Context7 前置查询

- 若对 Graphiti MCP 或 Neo4j API 用法不确定，先通过 **Context7** 查询 Graphiti MCP API（若 Context7 支持）；若 Context7 无对应库，参考官方文档（Graphiti https://help.getzep.com/graphiti/、Neo4j https://neo4j.com/docs/）。

### 1. 任务前：先搜索

```
1. 用 search_nodes 查与当前任务相关的 Preference、Procedure、Requirement；按实体类型过滤
2. 用 search_memory_facts 查相关事实与关系
3. 审查所有匹配；若有匹配，在后续执行中遵循并保持一致
4. 需要定向探索时，可使用 center_node_uuid 围绕特定节点搜索
```

### 2. 任务中：遵循并应用

```
1. 按检索到的偏好与程序执行；应用相关事实
2. 若用户提出新需求/偏好，立即 add_memory(name=..., episode_body=..., group_id="vernify", source="text")；类型可写在 name 或 episode_body 中（本 MCP 无 category 参数）
```

### 3. 任务后：自动写入（含按文档整体重构记忆）

**核心约定**：不读取 `.cursor/memories/`（已弃用）；记忆仅来自规范文件与 Graphiti。每次更新 Graphiti 时，**仅读取规范文件**（project-structure.mdc、docs/architecture/ARCHITECTURE.md、TECH-STACK-ANALYSIS.md、PRD.md、MODULARIZATION.md、docs/migration/CONTENT-SOURCE-MIGRATION.md、refactor-convention.mdc、agent-orchestration.mdc）理解**整体重构**记忆；架构内容以 docs/architecture/ARCHITECTURE.md 为准。不得写入与规范文件不一致的记忆。

```
1. 写入前：search_nodes / search_memory_facts 检索相关既有记忆
2. 按文档整体重构：比对既有记忆与项目文档（Rules、 docs/ 等），识别不一致处
3. 若发现与当前事实或文档不符（错误、过时、被推翻）：
   - 先用 delete_entity_edge 或 delete_episode 删除/移除错误记忆
   - 再 add_memory(name=..., episode_body=..., group_id="vernify") 写入正确内容
4. 若无冲突：用 add_memory(name=..., episode_body=..., group_id="vernify", source="text") 记录本次任务摘要或 Procedure / Fact
5. 不得仅追加新记忆而放任错误记忆存在
```

## 分类与类别

- **Preference**：用户偏好（技术栈、风格、约束等）
- **Procedure**：做某类事的步骤或约定
- **Requirement**：需求、约束
- **Fact**：实体间关系与事实
- **Episode**：一次任务/对话的摘要或片段

类型信息写在 **name** 或 **episode_body** 中（本 MCP 无 category 参数），便于日后检索。

## 注意事项

1. **长内容拆分**：很长需求拆成较短逻辑块再写入。
2. **更新要明确**：若为更新既有知识，只写入变更或新增部分，并标明为更新。
3. **按规范文件整体重构**：写入仅依据上述 8 个规范文件（project-structure.mdc、ARCHITECTURE.md、TECH-STACK-ANALYSIS.md、PRD.md、MODULARIZATION.md、CONTENT-SOURCE-MIGRATION.md、refactor-convention.mdc、agent-orchestration.mdc）；遵循 refactor-convention：**简化结构、突出主干、移除冗余**；发现既有记忆与规范文件不符时，必须先删除或改写错误事实，再写入正确记忆。
4. **证据优先**：检索到的内容优先于假设，保持一致。

## 与 Rule / Subagent / Command 的配合

- 规则：`graphiti-memory.mdc`
- Subagent：`graphiti-memory`（复杂记忆任务可委托）
- Command：`/graphiti-memory` 或 `/memory`（快速触发记忆存储或检索）
- **任务完成后必做流程**：完成有变更的任务后，必须执行 `post-task-workflow.mdc`（Graphiti 检查 → Serena 分析 → 重构 → 文档 → 知识同步），可运行 `/post-task-review` 或委托 post-task-reviewer

## 参考

- **Vernify 使用约定**：`docs/GRAPHITI-USAGE.md`
- [Graphiti MCP README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)
- [aivi.fyi Cursor Rules](https://www.aivi.fyi/aiagents/introduce-Graphiti-MCP-Server#cursor-rules)
