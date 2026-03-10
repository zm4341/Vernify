使用 **database-tester** 子代理和 **Supabase MCP** 完成下面这件事。

（若在 `/database-ops` 后还有文字，则那段文字就是「下面这件事」——例如：`/database-ops 查询 courses 表有多少条记录` 表示要查询课程数量。）

## 流程概览

| 步骤 | 内容 | 工具 |
|------|------|------|
| 1 | 理解任务 | 明确要查询、验证或操作的表与目标 |
| 2 | 使用 Supabase MCP | **必须**调用 `mcp_supabase_read_table_rows` 等 MCP 工具 |
| 3 | 验证与报告 | 以 MCP 返回结果为准，Evidence over claims |

## 工具声明：Supabase MCP

执行数据库相关任务时，**必须使用 Supabase MCP**：

- `mcp_supabase_read_table_rows`：查询表数据
- `mcp_supabase_create_table_records`：插入记录
- `mcp_supabase_update_table_records`：更新记录
- `mcp_supabase_delete_table_records`：删除记录

不得仅凭代码或假设推断数据，必须以 MCP 返回为准。

## 常见任务示例

- 列出某表记录数：`read_table_rows(table_name, limit=1)` 后扩展 limit 或统计
- 验证 API 写入：先调用 API，再用 MCP 查询对应表
- 数据修复：先 MCP 查询确认，再 update/delete，最后再 MCP 验证

## 参考

- Rule：`.cursor/rules/database-supabase.mdc`
- Skill：`.cursor/skills/database-supabase/SKILL.md`（MCP 操作）；`.cursor/skills/supabase-postgres-best-practices/`（SQL/性能最佳实践）
- Subagent：`.cursor/agents/database-tester.md`

---

现在请开始：把「下面这件事」当作当前任务，使用 Supabase MCP 完成。
