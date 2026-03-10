执行 **页面制作** 工作流。

（若在 `/page-maker` 后带参数，则按参数执行；否则执行默认流程。）

## 架构约定

- **主后端**：Next.js（前端 + BFF）；**扩展服务**：FastAPI 仅为 Next 提供 AI/LaTeX 等能力。详见 `project-structure.mdc`。

## 默认流程（适用于新建、重构、任何页面修改）

1. **Graphiti 检索**（必做）：检索与页面设计相关的偏好、程序、事实；遵循 page-maker.mdc、page-maker Skill
2. **读取项目文档**（必做）：至少读 `docs/architecture/ARCHITECTURE.md`、`docs/architecture/PRD.md`；参考同类型页面 DOM 与组件
3. **明确目标**：页面类型、功能与布局需求
4. **MDX 评估**：按 mdx-evaluation.mdc 评估是否需用 MDX（有 Markdown 源且需富格式 → 用；否则不用）
5. **设计系统**：用 ui-ux-pro-max 生成或确认风格、配色、字体
6. **代码实现**：在 `Web/app/` 或 `Web/components/` 下实现或修改；若需 MDX 参考 lib/mdx.tsx
7. **验证**：用 browser-tester 做视觉与交互检查

## 可选参数

- `/page-maker 落地页`：专门做落地页（LandingClient）重构
- `/page-maker 课程列表`：课程列表页
- `/page-maker Admin`：Admin 管理页
- `/page-maker [页面名]`：指定页面名称
- `/page-maker 课时页`：课时页（`app/lessons/[slug]/page.tsx`），内容用 **MDX** 渲染，支持 FadeIn/LetterByLetter/SlideUp 动画

## 前置与可选 Skill

- **必选**：ui-ux-pro-max skill
- **推荐**：browser-tester
- **可选**：frontend-design（差异化审美）、vercel-react-best-practices（性能）、web-design-guidelines（审查/可访问性）、**ai-sdk**（做 AI 对话/流式/口语练习页时，Marketplace）

请按用户意图执行对应步骤。
