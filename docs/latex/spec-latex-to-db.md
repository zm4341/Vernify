# Spec: LaTeX → 数据库 直接管道

> Spec 驱动 TDD | 任务：为 Vernify 增加 LaTeX→数据库功能，直接写入数据库

---

## 1. 需求澄清

### 1.1 目标
- **直接管道**：从用户选择或上传的 LaTeX 文件解析题目，写入 Supabase 数据库
- **直接管道**：LaTeX 解析在 `Web/backend/app/services/latex_parser/`，不依赖根目录 content/compiler
- **Web 界面**：在项目页面增加按钮和专用界面，点击后触发分析并同步到数据库
- **FastAPI 扩展服务**：用 Python 实现 LaTeX 解析与数据库写入，提供 HTTP API 供 Next.js 内部调用

### 1.2 LaTeX 目录结构（用户选择或上传的目录可包含）
```
Latex/Template/   # 或用户自定义结构
├── Main.tex                    # 主文件，\input{Source/Chapters/xxx}
├── Source/
│   ├── Chapters/               # 章节 .tex
│   │   ├── 00_Cover.tex
│   │   ├── 01_MultipleChoice.tex  # 选择题
│   │   ├── 02_FillInBlank.tex     # 填空题
│   │   ├── 03_Operations_and_Analysis.tex
│   │   └── 04_Exploration_and_Application.tex
│   └── Figures/                # 题目配图
│       ├── Chapter_01/Question_03.tex
│       └── ...
```

### 1.3 现有数据库 schema（Supabase）
- `courses`：课程 (id, title, slug, description, status)
- `lessons`：课时 (course_id, slug, title, content, content_source, order_index)
- `questions`：题目 (lesson_id, type, content, answer, rubric, points, order_index)

### 1.4 题目类型（LaTeX → DB 映射）
| LaTeX 环境 | DB type |
|-----------|---------|
| `\begin{tasks}...\end{tasks}`（单列/多列） | choice / multi_choice |
| `\underline{\hspace{...}}` 填空题 | fill_blank |
| 其它 | 暂定 essay / drawing |

---

## 2. 验收条件

### 2.1 功能验收（Given/When/Then）

**AC-1：分析 LaTeX 目录**
- **Given**：用户选择了包含 LaTeX 的目录，或通过 scan-from-files 上传了文件
- **When**：用户点击「分析 LaTeX」按钮
- **Then**：FastAPI 扩展服务扫描 `Source/Chapters/*.tex`，返回章节列表、每章题目数量、解析状态（成功/失败）

**AC-2：写入数据库**
- **Given**：分析完成且无致命错误
- **When**：用户点击「同步到数据库」
- **Then**：创建/更新 courses、lessons、questions 记录；返回同步结果（新增/更新数量）

**AC-3：专用界面**
- **Given**：用户进入「LaTeX 同步」页面
- **When**：页面加载
- **Then**：显示选择/上传区域、扫描按钮、同步按钮、结果反馈

**AC-4：规则与技能**
- **Given**：项目需要维护 LaTeX→DB 的解析逻辑
- **When**：规则/技能/子代理被创建
- **Then**：存在 `.cursor/rules/latex-to-db.mdc`、相关 Skill、Subagent 配置，并自动更新文档

### 2.2 非功能验收
- API 响应时间：分析 < 10s（单次）；同步 < 5s
- 错误处理：解析失败时返回具体错误信息，不中断其它章节

---

## 3. 影响范围

| 模块 | 变更 |
|------|------|
| **Web/backend/app/services/latex_parser/** | LaTeX 解析逻辑（从已删除的 compiler/ 迁移而来） |
| **Web/backend/** | 新增 FastAPI 路由 `/api/v1/latex/scan`、`/api/v1/latex/sync` |
| **Web/app/** | 新增页面 `/admin/latex-sync` 或课程管理页内嵌「LaTeX 同步」区块 |
| **.cursor/rules/** | 新增 `latex-to-db.mdc` |
| **.cursor/skills/** | 新增 `latex-parser` Skill |
| **docs/** | 自动追踪/更新 LaTeX→DB 流程文档 |

---

## 4. 风险

| 风险 | 缓解 |
|------|------|
| LaTeX 格式多变 | 复用 `latex_parser` 的解析逻辑，先支持 tasks/enumerate/underline 等已有模式 |
| 填空题解析复杂 | 初期只提取题干中的 `\underline{\hspace{...}}` 占位，不解析答案 |
| 权限与安全 | 同步接口需鉴权，仅 admin/teacher 可调用 |
| 大文件性能 | 流式解析，单章超时则跳过并记录 |

---

---

## 6. Serena 代码结构分析

### 6.1 入口与关键符号

| 模块 | 关键函数/符号 | 职责 |
|------|---------------|------|
| **Web/backend/app/services/latex_parser/parser.py** | `parse_content_root`, `_parse_chapter_tex` 及复用逻辑 | 解析 LaTeX 选择题/填空题，输出结构化数据 |
| **Web/backend/app/api/v1/latex.py** | `scan`, `scan_from_files`, `sync`, `sync_from_scan` | FastAPI 路由，写入 Supabase courses/lessons/questions |
| **Web/backend/app/main.py** | `app.include_router(ai_router, ...)` | FastAPI 入口，需新增 latex 路由 |
| **Web/app/api/v1/courses/route.ts** | `GET` | Next.js 课程 API（读 Supabase） |

### 6.2 依赖关系

```
Web/backend/app/services/latex_parser/parser.py
  ← parse_content_root, _parse_chapter_tex 及复用逻辑
  → 输出: { chapters: [{ stem, title, questions: [...] }] }

Web/backend/app/api/v1/latex.py
  ← 调用: app.services.latex_parser.parse_content_root
  ← 调用: sync_to_db.sync_course/sync_lesson/sync_questions（或内联 Supabase 写入）
  → HTTP: POST /api/v1/latex/scan, POST /api/v1/latex/sync
```

### 6.3 待改文件

- `Web/backend/app/main.py`：`include_router(latex_router, prefix="/api/v1/latex")`
- 新建 `Web/backend/app/api/v1/latex.py`
- LaTeX 解析已迁移至 `Web/backend/app/services/latex_parser/`（根目录 compiler 已删除）

---

## 7. 交付物清单

- [x] `Web/backend/app/services/latex_parser/`：LaTeX → 结构化题目（已迁移）
- [ ] `Web/backend/app/api/v1/latex.py`：FastAPI 路由
- [ ] `Web/app/admin/latex-sync/page.tsx`：同步管理页面
- [ ] `.cursor/rules/latex-to-db.mdc`：规则
- [ ] `.cursor/skills/latex-parser/SKILL.md`：技能
- [ ] Subagent 配置（若项目使用）
- [ ] 文档更新：`docs/latex/latex-to-db-flow.md`
