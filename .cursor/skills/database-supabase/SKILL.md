---
name: database-supabase
description: 使用 Supabase MCP 进行数据库测试与操作的技能。查询、验证、调试、数据修复时使用。
---

# 数据库 Supabase 操作技能

在 Vernify 项目中，使用 **Supabase MCP** 进行数据库相关操作。**必须使用 Supabase MCP 工具**，不得仅凭代码推断。

## 何时使用

- 验证表中数据是否存在、条数、内容
- 调试 API 与数据库数据不一致
- 集成测试后验证数据库写入
- 数据修复、测试数据清理
- 理解表结构与关联关系

## 工具声明：Supabase MCP

本技能**依赖 Supabase MCP**，提供以下工具：

| 工具 | 用途 |
|------|------|
| `mcp_supabase_read_table_rows` | 查询表数据，支持 filters、limit、order_by |
| `mcp_supabase_create_table_records` | 插入记录 |
| `mcp_supabase_update_table_records` | 更新记录（需 filters） |
| `mcp_supabase_delete_table_records` | 删除记录（需 filters） |

## 执行流程

### 1. 查询数据

```
1. 确认目标表名（courses, lessons, questions 等）
2. 调用 read_table_rows(table_name, filters?, limit?, order_by?)
3. 根据返回结果验证或继续操作
```

### 2. 验证数据一致性

```
1. 通过 API 或代码逻辑得到预期结果
2. 用 MCP read_table_rows 查询实际数据库
3. 对比并报告差异
```

### 3. 数据修复（谨慎）

```
1. 用 read_table_rows 确认问题记录
2. 用 update_table_records 或 delete_table_records 修复
3. 再次 read_table_rows 验证
```

## 表结构速查

- **courses**：id, title, slug, status, metadata
- **lessons**：id, course_id, slug, title, order_index
- **questions**：id, lesson_id, type, content, answer
- **submissions**：user_id, question_id, lesson_id, answer
- **profiles**：id, role, display_name, grade

## 注意事项

1. **外键约束**：插入时确保 course_id、lesson_id 等引用有效
2. **JSONB 字段**：content、answer、metadata 为 JSON，传对象即可
3. **UUID**：id 通常由数据库生成，插入时可省略
4. **删除**：仅对测试数据执行 delete，生产核心数据需人工确认

## 与 Rule / 其他 Skill 的配合

- 规则：`database-supabase.mdc`
- Subagent：`database-tester`
- Command：`/database-ops`
- **SQL/性能**：写查询、设计表、加索引、RLS 或性能优化时，同时参考 **supabase-postgres-best-practices**（`.cursor/skills/supabase-postgres-best-practices/`）
