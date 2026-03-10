# LaTeX → 数据库 流程文档

## 概述

Vernify 支持**直接从 LaTeX 解析题目并写入数据库**。LaTeX 源文件通过 Admin 页面 `/admin/latex-sync` 选择文件夹（showDirectoryPicker）或上传文件（scan-from-files）提供，经 FastAPI 同步到 Supabase。

## 架构

```
用户选择的 LaTeX 目录（如 Latex/Template/Source/Chapters/*.tex）或 scan-from-files 上传的文件
         │
         ▼
Web/backend/app/services/latex_parser/ (parse_content_root)
         │
         ├── 目录扫描与 Main.tex 解析
         ├── process_multiple_choice  → 选择题
         ├── _extract_fill_blank_questions  → 填空题（简单）
         ├── _extract_essay_drawing_questions  → 大题（essay / drawing）
         ├── scan_figures_tex  → Source/Figures/**/*.tex（TikZ）
         └── scan_svg_files  → build/svg/*.svg
         │
         ▼
FastAPI /api/v1/latex/scan 或 /sync
         │
         ▼
Supabase (courses, lessons, questions)
```

## 入口

### 1. 命令行

```bash
# 通过 Admin 页面 /admin/latex-sync 或 API 调用 scan-from-files、sync-from-scan
# LaTeX 解析在 Web/backend/app/services/latex_parser/ 内，Docker 与本地均可用
```

### 2. FastAPI

- `GET /api/v1/latex/scan` - 扫描 LaTeX 根路径，返回章节和题目预览（需 content_root 参数；Docker 请用 scan-from-files）
- `POST /api/v1/latex/sync` - 同步到数据库

### 3. Admin 界面

访问 `/admin/latex-sync`，流程为：**选择文件夹 → 显示路径/名称 → 点击扫描 → 展示内容 → 同步到数据库**。

1. **选择或输入目录**：点击「选择文件夹」（File System Access API）或输入本地 backend 路径
2. **选择文件夹后**：仅显示已选路径/名称，**不自动扫描**；需手动点击「扫描」才调用 API
3. **扫描结果**：展示 LaTeX 章节与题目（可展开）、TikZ 图形、SVG 文件网格、Manim/Python 文件列表
4. **同步**：点击「同步到数据库」将已扫描数据写入 Supabase（不重复解析）

## LaTeX 格式约定

| 类型 | 环境 | 说明 |
|------|------|------|
| 选择题 | `\begin{tasks}...\end{tasks}` | 在 enumerate 的 item 内 |
| 填空题 | `\underline{\hspace{...}}` + `\score` | 简单题，无嵌套 |
| 大题 | `\inputfigure` 或嵌套 enumerate/itemize | essay / drawing |
| Figures | `Source/Figures/**/*.tex` | TikZ 源码，存 figure_path，不 RAG |
| SVG | `build/svg/*.svg` | 同步时复制到 Web/public/assets |

## 数据库表

- **courses**：课程（slug, title, description）
- **lessons**：课时（slug=章节 stem，title=章节标题）
- **questions**：题目（type, content, answer, points, order_index）

## 相关文件

| 文件 | 作用 |
|------|------|
| `Web/backend/app/services/latex_parser/parser.py` | 直接解析 LaTeX，输出结构化数据（从 compiler 迁移） |
| `Web/backend/app/services/latex_parser/__init__.py` | 导出 parse_content_root |
| `Web/backend/app/api/v1/latex.py` | FastAPI 路由 |
| `Web/app/admin/latex-sync/page.tsx` | Admin 同步界面 |
| `.cursor/rules/latex-to-db.mdc` | Cursor 规则 |
| `.cursor/skills/latex-parser/SKILL.md` | Cursor Skill |
| `.cursor/agents/latex-parser.md` | Cursor Subagent |

## 更新日志

- 2026-02：latex-sync 页面 UI 调整：选择文件夹后不自动扫描，仅显示路径/名称；需手动点击「扫描」才调用 API；扫描结果展示章节与题目（可展开）、TikZ 图形、SVG 网格、Manim/.py 文件列表。
- 2026-02：LaTeX 解析从根目录 compiler 迁移至 `Web/backend/app/services/latex_parser/`，Docker 与本地均可用 scan-from-files、sync-from-scan。
- 2025-02：首次实现 LaTeX 直接解析与 Admin 同步界面。
