---
name: serena-code-structure
description: 在制定实现计划前，用 Serena MCP 分析相关代码的符号结构、依赖与引用。结合模块化思维（高内聚低耦合、接口与实现分离）。与 spec-driven-tdd 规则配合使用。
---

# Serena 代码结构分析

在已有**规格/验收条件**之后、制定**实现计划**之前，用 Serena 明确相关代码结构，避免盲目修改。结合**模块化思维**（参考[模块化编程](https://zh.wikipedia.org/wiki/模块化编程)）。

## 何时使用

- 完成 spec-driven-analysis 之后
- 需要确定要改哪些文件、哪些符号、谁在引用时
- 重构、修 Bug 或加功能前需要「先看图再动手」

## 模块化思维

- **高内聚**：每个模块应负责单一职责，内部逻辑紧密相关。
- **低耦合**：模块间通过清晰接口交互，减少隐式依赖。
- **接口与实现分离**：识别哪些是「对外接口」（会被其他模块调用），哪些是内部实现。
- **依赖方向**：明确 A 依赖 B 还是 B 依赖 A，用于任务排序。

## Serena 工具速查

| 目的           | 工具 | 说明 |
|----------------|------|------|
| 文件符号概览   | `get_symbols_overview(relative_path, depth?)` | 类/函数/导出一览 |
| 按名找符号     | `find_symbol(name_path_pattern, relative_path?, depth?)` | 精确符号，支持路径如 `Class/method` |
| 查谁在引用     | `find_referencing_symbols(name_path, relative_path)` | 改前必看，避免漏改 |
| 目录与文件     | `list_dir(relative_path, recursive?)` | 模块边界、入口文件 |
| 模式搜索       | `search_for_pattern(substring_pattern, ...)` | 正则搜代码或配置 |
| 读文件/片段    | `read_file(relative_path, start_line?, end_line?)` | 看实现细节 |

（以上为 MCP 工具名，在 Cursor 中通过 Serena MCP 调用。）

## 执行步骤

### 1. 确定分析范围

根据规格中的**影响范围**和**模块清单**列出：

- 目录（如 `Web/app/` 主后端，`Web/backend/app/` 扩展服务 FastAPI）
- 可能涉及的文件（如注册页、Supabase client、Kong 配置）
- 模块边界（哪些目录/文件属于同一模块）

### 2. 先概览再深入

- 对关键文件调用 `get_symbols_overview(relative_path, depth=1)`，得到顶层符号。
- 对要改的类/函数调用 `find_symbol` 看定义，再 `find_referencing_symbols` 看引用。
- **识别接口**：哪些符号被外部引用（跨文件/跨目录）？这些是接口，修改需谨慎。

### 3. 记录结构结论

向后续步骤提供简短结论，例如：

- **入口/入口点**：哪些页面、API、脚本会走到要改的逻辑
- **关键符号**：要改或要新增的类/函数/组件及所在文件
- **模块与接口**：受影响模块、接口符号、内部实现符号
- **依赖与引用**：谁调用了这些符号，是否跨服务/跨层；依赖方向
- **配置与数据**：相关 env、配置文件、表结构（若涉及）

### 4. 与计划衔接

- 把「关键符号」「依赖顺序」「模块边界」交给 **tdd-plan-and-implement**，用于拆任务和排序。
- 若需批量重命名/替换，优先用 Serena 的 `rename_symbol`、`replace_content`，避免漏改。

## 示例（注册验证码问题）

- **范围**：`Web/app/register/page.tsx`、`Web/lib/supabase/client.ts`、Kong 配置、Caddy 路由。
- **模块**：前端（register）→ 客户端（supabase）→ 网关（Caddy/Kong）→ Auth。
- **Serena 操作**：
  - `get_symbols_overview("Web/app/register/page.tsx", 1)` → 看页面组件与处理函数
  - `find_symbol("createClient", "Web/lib/supabase/client.ts")` → 看 Supabase 客户端
  - `find_referencing_symbols("createClient", "Web/lib/supabase/client.ts")` → 看哪些页面在用
- **结论**：注册页用 `createClient()` 调 `signInWithOtp`；请求需经 Caddy → Kong；`createClient` 是跨模块接口；列出需检查的配置与环境变量。

## 注意事项

- **先理解再操作**：与 `.cursor/tools-strategy.md` 一致，SemanticSearch 可先做概念探索，Serena 做精确结构与引用分析。
- **不跳过**：在 spec-driven-tdd 流程中，不得在未做 Serena 分析的情况下对不熟悉的模块做大范围修改。
- **模块化**：改接口时务必查清所有引用方，避免破坏其他模块。

## 参考

- 开发流程以 `task-priority-workflow.mdc` 与 `docs/CLAUDE-CURSOR-COLLABORATION.md` 为准。
