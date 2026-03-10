# 课时内容迁移记录

**应用不依赖任何 .md 静态内容或 JSON 文件**。课时正文仅存于数据库（`lessons.content_source`），前端用 **MDX (next-mdx-remote)** 渲染，支持 Markdown + JSX 及动画组件（FadeIn、LetterByLetter、SlideUp 等）；除课程数据与登录信息外，其余按静态/DB 方式处理。LaTeX 内容通过其他方式直接导入数据库。

---

## 1. 变更概览

| 类别 | 变更内容 |
|------|----------|
| **依赖** | MDX 渲染课时正文（字符串来自 DB） |
| **数据库** | 课时正文列为 `lessons.content_source`（见迁移 004） |
| **前端** | `next-mdx-remote` + 自定义代码块（如 ` ```quiz\nid\n``` ` → `<QuizBlock />`） |
| **FastAPI 扩展服务** | LaTeX 同步等直接写入 `content_source` |

---

## 2. 具体变更清单

### 2.1 前端

| 路径 | 变更 |
|------|------|
| `app/lessons/[slug]/page.tsx` | **MDX (next-mdx-remote)** 渲染 `lesson.content`（来自 DB）；支持 `<QuizBlock id="x" />`、` ```quiz\nid\n``` `；`code` 组件识别 `language-quiz` 渲染 `<QuizBlock />`；支持 FadeIn、LetterByLetter、SlideUp 等动画 |
| `lib/content/lessons-db.ts` | 读写 `content_source` |
| `lib/schemas/course.ts` | `LessonSchema` 使用 `content_source` |

### 2.2 扩展服务（FastAPI）

| 路径 | 变更 |
|------|------|
| `backend/app/models/course.py` | `Lesson` / `LessonCreate` / `LessonUpdate` 使用 `content_source` |
| `backend/app/api/v1/latex.py` | `_build_content_source_from_chapter`，写入 `content_source` |

### 2.3 数据来源（无 JSON 回退）

- 课时正文：仅来自 DB `lessons.content_source`，**不读取** JSON 文件。
- 题目数据：仅来自 DB `questions` 表。
- **Web/content 已删除**（历史遗留 lessons/*.json 等），**应用完全不使用**。
- 根目录 `content/`、`Content/` 若被工具创建，`.gitignore` 不跟踪。backend/worker 使用 **content_anon** 匿名卷挂载 `/app/content`，避免绑定 `../content` 时 Docker 在宿主机根目录创建 Content；应用完全不依赖 content 目录。

---

## 3. 课时正文格式约定

- **存储**：`lessons.content_source` 存 Markdown 文本（由导入流程写入）。
- **测验块**：` ```quiz\nquiz_0\n``` ` 由前端渲染为 `<QuizBlock id="quiz_0" />`。
- **兼容**：前端将旧写法 `<QuizBlock id="x" />` 转为上述代码块再渲染。

---

## 4. 验收与注意

- **构建**：在 `Web` 目录执行 `npm run build` 应通过。
- **迁移**：需应用迁移 004。
- **内容来源**：仅数据库；无 .md、无 JSON 静态文件参与。
