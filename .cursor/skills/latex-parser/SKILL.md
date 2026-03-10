---
name: latex-parser
description: Parse Vernify LaTeX and sync to database. Use when working with LaTeX parsing, Web/backend/app/services/latex_parser, or syncing questions to Supabase. LaTeX 来源：Admin 选择目录或 scan-from-files 上传。
---

# LaTeX Parser Skill

## Purpose

Parse LaTeX files from user-selected directory or upload, and sync questions to Supabase. 支持 Chapters/*.tex 等结构。

## Key Files

- `Web/backend/app/services/latex_parser/parser.py` - Direct parser (parse_content_root, _parse_chapter_tex)
- `Web/backend/app/api/v1/latex.py` - FastAPI routes (scan, scan-from-files, sync, sync-from-scan)

## Workflow

1. **Scan**: Call `parse_content_root()` → returns `{ content_root, latex_root, chapters }`
2. **Sync**: For each chapter, create/update lesson, then sync questions via `_latex_questions_to_db`

## Question Types

| LaTeX Pattern | Type | Extraction |
|---------------|------|------------|
| `\begin{tasks}...\end{tasks}` | choice | process_multiple_choice |
| `\underline{\hspace{...}}` in enumerate | fill | _extract_fill_blank_questions |

## DB Format

Questions must have: `type`, `content.stem`, `content.options`, `answer.correct`, `answer.explanation`, `points`, `order_index`.
