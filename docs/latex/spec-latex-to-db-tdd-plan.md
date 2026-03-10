# TDD 计划：LaTeX → 数据库

## 任务拆分

| # | 任务 | 测试（Red） | 实现（Green） | Refactor |
|---|------|-------------|---------------|----------|
| 1 | `latex_parser` 解析单章选择题 | 测试 `parse_chapter_tex` 返回题目列表 | 在 `Web/backend/.../latex_parser/` 实现 | 抽取公共函数 |
| 2 | `latex_parser` 扫描 LaTeX 根路径 | 测试 `parse_content_root` 返回章节列表 | 调用 parse_latex_catalog | - |
| 3 | FastAPI `/api/v1/latex/scan` | 测试返回 JSON 含 chapters | 实现路由 | - |
| 4 | FastAPI `/api/v1/latex/sync` | 测试写入 Supabase | 实现路由 | - |
| 5 | Admin 页面「LaTeX 同步」 | 手动/浏览器验证 | 创建页面与按钮 | - |
| 6 | Rules、Skills、文档 | - | 创建 .cursor/rules、skills、docs | - |

## 执行顺序

1. 在 `Web/backend/app/services/latex_parser/` 实现并写单元测试
2. 创建 `Web/backend/app/api/v1/latex.py`
3. 注册路由到 main.py
4. 创建 `Web/app/admin/latex-sync/page.tsx`
5. 创建 Rules、Skills、文档
