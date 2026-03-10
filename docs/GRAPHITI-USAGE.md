# Graphiti 在 Vernify 中的使用约定

Graphiti 是 Vernify 项目所有 AI 工具的**统一核心记忆**（Claude Code + Cursor 共享）。

- **MCP endpoint**：`http://localhost:19283/mcp`（**不要**末尾斜杠，否则 307）
- **group_id**：`vernify`（禁止用 `vernify-project`，已删除）
- **Cursor 内 MCP 服务器名**：`user-graphiti`（call_mcp_tool 时用此名）

---

## Graphiti 的定位

Graphiti 不只是补充记忆，而是**首要知识来源**。**长期复用信息以 Graphiti 为准**：主会话优先用检索结果作答，避免在对话中反复粘贴大段历史或文档，以控制上下文与 Token。

- **配置参考**：Agent目录、命令列表、Skills目录、SubAgent分工 → 存于Graphiti，任务开始时检索
- **用户偏好（Preference）**：用户的工作习惯、偏好设置
- **程序（Procedure）**：如何做某类任务的步骤
- **架构事实（Fact）**：架构决策、模块关系、重要约定
- **任务历史（Episode）**：做过的事、关键结论、变更记录

---

## 任务前：始终先搜索

```text
search_nodes(query="<任务关键词>", group_ids=["vernify"])         # 查 Preference、Procedure、配置参考
search_memory_facts(query="<任务关键词>", group_ids=["vernify"])  # 查关系与事实（Cursor 中工具名；Claude 侧可能为 search_facts）
```

- 用 `center_node_uuid` 围绕特定节点做定向扩散搜索
- 遵循检索结果执行；Claude Code写入的记忆 Cursor 也能读到，反之亦然

## 任务后：始终写入

```text
add_memory(name="任务摘要", episode_body="...", group_id="vernify", source="text")
```
（本 MCP 仅暴露 add_memory，无单独 add_episode；详见 `docs/GRAPHITI-MCP-REFERENCE.md`。）

- **整体重构**：写入前先检索既有记忆；发现错误/过时内容先 `delete_entity_edge` 或 `delete_episode`，再写入正确内容，不仅追加
- 长内容拆分为多个短逻辑块分别写入
- 发现用户行为规律时，主动记录为 Preference 或 Procedure

---

## 现有知识目录（可直接检索）

| 检索关键词 | 内容 |
| --- | --- |
| "Claude Code Agent 目录" | 9个Agent模板的职责与使用时机 |
| "斜杠命令" | 6个命令+插件命令的功能与使用时机 |
| "Skills 目录" | 9个Skills的触发条件 |
| "Claude Code × Cursor 分工" | 两工具的协作分工约定 |
| "Vercel Agent Skills" | Vercel官方Skills安装记录 |
| "claude-plugins-official" | hookify/commit-commands插件集成 |
| "Cursor SubAgent 分工" | 任务类型→SubAgent 表 |
| "Cursor 斜杠命令" | 命令→SubAgent/流程 |
| "Cursor Rules 摘要" | 核心 Rule 列表 |
| "Cursor Skills 目录" | Skills 分类与来源 |

---

## 参考

- **API 与参数统一**：`docs/GRAPHITI-MCP-REFERENCE.md`（add_memory 必填 name + episode_body；Cursor 服务器名 user-graphiti）
- [Graphiti MCP README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)
- `.cursor/rules/graphiti-memory.mdc`
- `docs/CLAUDE-CURSOR-COLLABORATION.md`
