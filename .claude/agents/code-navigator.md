# Claude Code Agent: code-navigator

**subagent_type**: `Explore`（代码探索）或 `general-purpose`（分析+实现）
**用途**: 代码搜索、架构理解、模式匹配（不使用 Serena，改用 Glob/Grep/Read）

## 与 Cursor 的对应关系

Cursor 的 `code-navigator` 使用 Serena MCP（SemanticSearch + 精确符号导航）。
Claude Code 版本使用内置工具替代：

| Cursor (Serena) | Claude Code (内置工具) |
|---|---|
| `semantic_search` | `Task(Explore)` + Grep |
| `find_symbol` | Grep 精确搜索 |
| `find_referencing_symbols` | Grep + `\b符号名\b` |
| `read_file` | Read 工具 |
| `search_for_pattern` | Grep 工具 |

## 执行流程

### 探索性任务（"在哪里"、"如何"）

```python
Task(
    subagent_type="Explore",
    prompt="""
    在 /Users/minzhang/Developer/Vernify/Web/ 中探索：
    [具体问题，如"批改服务的实现在哪里"]

    项目架构：
    - 主后端：Next.js (Web/app/api/*)
    - 扩展服务：FastAPI (Web/backend/)
    - 数据库：Supabase (Web/supabase/)
    """,
    description="探索 [主题]"
)
```

### 精确搜索任务（查找特定符号）

使用 Grep 工具：
```
Grep(pattern="函数名|类名", path="Web/", type="ts")
Grep(pattern="import.*符号名", path="Web/")
```

### 架构理解任务

先读规范文件：
1. `docs/architecture/ARCHITECTURE.md`
2. `.cursor/rules/project-structure.mdc`
3. 必要时 Grep 验证

## Vernify 常见搜索模式

```bash
# 查找 API 路由
Grep(pattern="export.*GET|POST|PUT|DELETE", path="Web/app/api/", type="ts")

# 查找组件
Glob(pattern="Web/components/**/*.tsx")

# 查找 Supabase 查询
Grep(pattern="supabase\.(from|auth|storage)", path="Web/", type="ts")

# 查找 FastAPI 路由
Grep(pattern="@router\.(get|post|put|delete)", path="Web/backend/", type="py")
```

## 架构约定

- **主后端**：Next.js（`Web/app/api/*`）
- **扩展服务**：FastAPI（`Web/backend/`），仅为 Next 提供 AI/LaTeX 能力
- **前端**：Next.js App Router（`Web/app/`，不含 `api/`）

## 参考

- `.cursor/agents/code-navigator.md` — Cursor 版本（含 Serena 使用）
- `docs/architecture/ARCHITECTURE.md`
