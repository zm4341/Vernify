---
name: page-maker
description: Vernify 页面制作工作流。设计须调用 ui-ux-pro-max、参考 Graphiti 与项目文档；按设计系统实现页面，并用 browser-tester 验证。
---

# 页面制作 Skill

## 架构约定（Vernify）

- **主后端**：Next.js（前端 + BFF）；**扩展服务**：FastAPI 仅为 Next 提供 AI/LaTeX 等能力。详见 `project-structure.mdc`、`docs/architecture/ARCHITECTURE.md`。

## 何时使用

- 用户要**新建页面**或**重构页面**
- 用户要**修改**现有页面的布局、样式、内容
- 用户提到**落地页**、**课程页**、**Admin**、**改版**、**制作 UI**

## 执行流程

### 1. 设计前准备（必做，不可跳过）

- **Graphiti 检索**：委托 **graphiti-memory** 或使用 Graphiti MCP（`search_nodes`、`search_memory_facts`）检索与页面设计相关的偏好、程序、事实；遵循检索到的设计约定
- **读取项目文档**：至少阅读 `docs/architecture/ARCHITECTURE.md`、`docs/architecture/PRD.md`；若存在设计规范（如 `docs/architecture/DESIGN.md`）则一并阅读；参考 `.cursor/rules` 下的 page-maker、font-lxgw-wenkai、mdx-evaluation 等
- **参考现有页面**：参考同类型页面（如课程详情 `app/courses/[id]`、Admin 子页）的 DOM 与组件结构，保持风格一致

### 2. 明确目标

- 是新建、重构还是修改？
- 页面类型（落地页、列表、详情、Admin）
- 功能与布局需求

### 3. MDX 评估（必做）

- 按 **mdx-evaluation.mdc** 规则评估：该页面是否有 Markdown/MDX 源（DB/CMS/配置）且需富格式？
- **是**：使用 MDX（`lib/mdx.tsx` 的 MdxText 或课时页 mdxComponents）；课程描述、落地页 Hero 等
- **否**：不使用 MDX（登录/注册/聊天/Admin 等表单或操作型页面）
- 详见 Rule `.cursor/rules/mdx-evaluation.mdc`

### 4. 设计系统（必须使用 ui-ux-pro-max）

- **必须**调用 **ui-ux-pro-max** Skill 生成或确认风格、配色、字体
- 需强辨识度时可参考 **frontend-design**（差异化审美）
- Vernify 当前：深紫渐变、LXGW WenKai、教育科技

### 5. 代码实现

- 在 `Web/app/` 或 `Web/components/` 下实现或修改
- 遵循 `project-structure.mdc`、`lesson-structure.mdc`
- 可参考 **vercel-react-best-practices**（React/Next.js 性能与模式）
- 复用现有组件（如 QuizBlock、LessonLayout）
- **课时页**：内容用 **MDX (next-mdx-remote)** 渲染，支持 Markdown + JSX；可用动画组件 FadeIn、LetterByLetter、SlideUp（见 `components/ContentAnimation.tsx`）

### 6. 验证

- 用 **browser-tester** 做视觉与交互检查
- 可选 **web-design-guidelines** 做可访问性/设计审计
- 检查响应式（375px、768px、1024px）

## 落地页重构要点

- 当前：`LandingClient`（未登录） + `HomeClient`（已登录）
- 落地页需：Hero、价值主张、CTA（登录/注册）
- 保持 Vernify 品牌色（#7c3aed、#a855f7）

## 引用（设计时必须遵循）

- **Rule**：`.cursor/rules/page-maker.mdc`（页面制作规范，含设计前必做流程；设计须用 ui-ux-pro-max、Graphiti 与文档参考）
- 任务开始完整步骤以 `task-priority-workflow.mdc` 与 `docs/CLAUDE-CURSOR-COLLABORATION.md` 为准
- **SubAgent**：`.cursor/agents/page-maker.md`（页面制作专家）
- **Command**：`/page-maker`（执行页面制作工作流，可带参数如 `/page-maker Admin`）
- **必用 Skill**：**ui-ux-pro-max**（设计系统，生成或确认风格、配色、字体）
- **可选 Skill**：**frontend-design**（差异化界面）、**vercel-react-best-practices**（性能）、**web-design-guidelines**（审查/可访问性）
