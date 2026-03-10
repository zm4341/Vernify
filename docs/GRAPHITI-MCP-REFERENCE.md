# Graphiti MCP 在 Vernify 中的统一参考

本文档为 **实际 MCP 行为** 与项目内用语的对照，避免 Rule/Skill/文档 与真实 API 不一致。

---

## 1. Cursor 侧 MCP 服务器名与 URL

- **MCP 服务器名**（call_mcp_tool 时）：**`user-graphiti`**（不是 `graphiti`）
- **URL**：**`http://localhost:19283/mcp`**（**不要**末尾斜杠，否则会 307 重定向）

---

## 2. 实际工具列表（Cursor 内 user-graphiti）

| 工具 | 用途 |
|------|------|
| `search_nodes` | 按 query、group_ids 检索节点 |
| `search_memory_facts` | 检索事实与关系（**无** `search_facts` 此名，仅 `search_memory_facts`）|
| `add_memory` | **唯一写入入口**：向图谱添加 episode（见下）|
| `delete_episode` | 删除错误事件 |
| `delete_entity_edge` | 删除错误事实/边 |
| `get_episodes` / `get_entity_edge` / `get_status` / `clear_graph` | 其他维护用 |

**说明**：本 MCP **没有** 单独的 `add_episode` 工具；写入任务摘要或结构化记忆均用 **`add_memory`**。

---

## 3. add_memory 的真实参数（必遵）

来自 Cursor 内 `user-graphiti` 的 schema：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| **name** | string | ✅ | 本条记忆/episode 的名称 |
| **episode_body** | string | ✅ | 要持久化的**正文**（纯文本或 JSON 字符串）|
| group_id | string | 否 | 图组 ID，Vernify 统一用 `vernify` |
| source | string | 否 | `text`（默认）/ `json` / `message` |
| source_description | string | 否 | 来源描述 |
| uuid | string | 否 | 可选 UUID |

**错误用法**：`add_memory(name, content, category, group_id)` —— 本 MCP **没有** `content` 和 `category` 参数，会报 `episode_body Field required`。

**正确用法**：`add_memory(name="...", episode_body="...", group_id="vernify", source="text")`

---

## 4. 与项目内用语对照

| 项目内常说 | 实际对应 |
|------------|----------|
| 「用 add_episode 记录任务摘要」| 用 **add_memory**(name=任务摘要标题, episode_body=内容, group_id="vernify", source="text") |
| 「add_memory 记 Procedure/Preference」| 同上，把类型信息写在 **name** 或 **episode_body** 里（如 name="Procedure: ..."）|
| 「search_facts」| Cursor 中工具名为 **search_memory_facts**；Claude Code 侧可能仍为 search_facts，以各自 MCP 为准 |

---

## 5. 规范文件中的修正要点

- **.cursor/rules/graphiti-memory.mdc**、**.cursor/skills/graphiti-memory/SKILL.md**、**.cursor/agents/graphiti-memory.md**、**.cursor/commands/graphiti-memory.md**：凡写 `add_memory(..., content=..., category=...)` 的，改为 **episode_body**，并说明可选 **source**；若同时写 add_episode，注明「本 MCP 仅暴露 add_memory，任务摘要与 Procedure 均用 add_memory(name, episode_body, group_id, source)」。
- **docs/GRAPHITI-USAGE.md**：URL 改为无尾斜杠；检索工具写 **search_memory_facts**（Cursor）；写入示例用 add_memory(name, episode_body, group_id, source)。
- **.claude/agents/graphiti-memory.md**：若 Claude Code 侧 MCP 参数不同，保留其写法，但加一句「Cursor 侧以 docs/GRAPHITI-MCP-REFERENCE.md 为准」。

---

## 6. 参考

- Cursor 内工具 schema：`.cursor/projects/.../mcps/user-graphiti/tools/add_memory.json`
- 使用约定：`docs/GRAPHITI-USAGE.md`、`.cursor/rules/graphiti-memory.mdc`
