使用 **graphiti-memory** 子代理和 **Graphiti MCP** 完成下面这件事。

（若在 `/graphiti-memory` 或 `/memory` 后还有文字，则那段文字就是「下面这件事」——例如：`/memory 记录：今天修复了课程页学科默认展开问题` 表示要把该条写入记忆。）

## 流程概览

| 步骤 | 内容 | 工具 |
|------|------|------|
| 1 | 理解任务 | 明确要检索、存储或更新的记忆内容 |
| 2 | 检索（若需要） | 使用 `search_nodes` / `search_memory_facts` 查既有偏好、程序、事实 |
| 3 | 写入（若需要） | 使用 `add_memory(name=..., episode_body=..., group_id="vernify", source="text")` 存储新信息或本次任务摘要 |
| 4 | 报告 | 以 MCP 返回结果为准 |

## 工具声明：Graphiti MCP

执行记忆相关任务时，**必须使用 Graphiti MCP**：

- `search_nodes`：按类型检索节点（Preference、Procedure、Requirement 等）
- `search_memory_facts`：检索事实与关系
- `add_memory`：添加 episode（必填 name + episode_body，可选 group_id、source）。无 add_episode 工具。见 `docs/GRAPHITI-MCP-REFERENCE.md`

## 常见任务示例

- **存一份本次任务摘要**：用 `add_memory(name="任务摘要", episode_body="完成了什么、关键结果", group_id="vernify", source="text")`。
- **查用户之前对某事的偏好**：`search_nodes` 指定类型 Preference，或 `search_memory_facts` 查相关事实。
- **记录新程序**：用户说明「以后都这样办」时，用 `add_memory`，name 可含 "Procedure:"，episode_body 写步骤；本 MCP 无 category 参数。

## 参考

- Rule：`.cursor/rules/graphiti-memory.mdc`
- Skill：`.cursor/skills/graphiti-memory/SKILL.md`
- Subagent：`.cursor/agents/graphiti-memory.md`
- **详细使用说明**：`docs/GRAPHITI-USAGE.md` 与 `graphiti-memory.mdc`
- **官方说明**：[Graphiti MCP README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)、[aivi.fyi Cursor Rules](https://www.aivi.fyi/aiagents/introduce-Graphiti-MCP-Server#cursor-rules)

---

现在请开始：把「下面这件事」当作当前任务，使用 Graphiti MCP 完成；若用户未写具体内容，则检索最近相关记忆或提示用户可输入要存储/检索的内容。
