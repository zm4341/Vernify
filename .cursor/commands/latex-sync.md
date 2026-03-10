执行 **LaTeX → 数据库** 同步流程。

（若在 `/latex-sync` 后带参数，则按参数执行；否则执行默认流程。）

## 默认流程

1. **扫描**：LaTeX 解析已迁移至 `Web/backend/app/services/latex_parser/`；通过 Admin 页面 `/admin/latex-sync` 使用 showDirectoryPicker 或 scan-from-files 获取解析结果。
2. **同步**（用户确认后）：调用 `POST /api/v1/latex/sync`（Next BFF 代理至 FastAPI），将题目写入 Supabase。

## 可选参数

- `/latex-sync scan`：仅扫描，不写库
- `/latex-sync sync`：直接同步到数据库（需 Next 与 FastAPI 扩展服务运行或 SUPABASE 配置正确）
- `/latex-sync open`：打开 Admin 页面 `/admin/latex-sync`（LaTeX/Manim 解析与同步，支持 showDirectoryPicker 选择文件夹、scan-from-files、sync-from-scan）在浏览器中操作

## 前置条件

- **注意**：LaTeX 解析位于 `Web/backend/app/services/latex_parser/`，Docker 与本地均可用。通过 Admin 页面 `/admin/latex-sync`（showDirectoryPicker、scan-from-files、sync-from-scan）提供 LaTeX 源并同步到 DB。
- 同步时需配置 `SUPABASE_SERVICE_ROLE_KEY`（见 `Web/.env`）

请按用户意图执行对应步骤。
