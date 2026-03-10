# Vernify 项目 Skills

本目录包含项目级别的 Cursor Skills，为 AI 提供专业领域知识和工作流。**任务开始时**可检索 Graphiti（关键词 **Cursor Skills 目录**）获取目录摘要；本页保留完整分类便于维护与查阅。**以项目为准**：与全局 `~/.cursor/skills-cursor/` 同名技能已在此合并，仅使用本目录即可，无需依赖全局副本。

## 已安装的 Skills

### UI/UX 设计
- **ui-ux-pro-max** - UI/UX 设计专家，提供设计系统、颜色、排版等指导
- **web-design-guidelines** - 按 Web Interface Guidelines 审查 UI（100+ 条可访问性/UX 规则），来自 [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **frontend-design** - 打造有辨识度的生产级前端界面，避免通用 AI 审美（anthropics/skills）

### React / Next.js（vercel-labs/agent-skills）
- **vercel-react-best-practices** - Vercel 的 React/Next.js 性能与最佳实践（58 条规则：数据获取、服务端/客户端、bundle 优化等），`npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices`
- **vercel-composition-patterns** - React 组件组合模式（compound components、避免 boolean props、React 19），`npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns`

### Marketplace Skills（.agents/skills/，[vercel-labs/skills](https://github.com/vercel-labs/skills) CLI）
- **ai-sdk** - Vercel AI SDK 官方 Skill。安装：项目根执行 `npx skills add vercel/ai -y`。用于 generateText、streamText、useChat、ToolLoopAgent、工具调用、流式输出、transcribe/generateSpeech（STT/TTS）等。触发词：AI SDK、Vercel AI SDK、generateText、streamText、useChat、build an agent、tool calling、structured output。

### Cursor 工具
- **create-rule** - 创建 Cursor 规则文件
- **create-skill** - 创建新的 Cursor 技能
- **update-cursor-settings** - 修改 Cursor 设置

### 数据库
- **supabase-postgres-best-practices** - Supabase/Postgres 性能与最佳实践（查询、索引、RLS、连接池等，来自 supabase/agent-skills）
- **database-supabase** - 使用 Supabase MCP 做数据库查询、验证与数据修复

### 测试与调试
- **test-coverage-strategy** - 制定测试覆盖策略（单元/集成/E2E、优先级、缺口分析）
- **systematic-debugging** - 四阶段系统化调试（先根因再修、根因追溯、防御式分层、条件等待），来自 obra/superpowers
- **verification-before-completion** - 完成前必须验证（Evidence over claims），来自 obra/superpowers
- **finishing-a-development-branch** - 分支完成决策（merge/PR/保留/丢弃），来自 obra/superpowers

### 系统工具
- **skill-creator** - 技能创建指南（系统级）
- **skill-installer** - 技能安装器（系统级）
- **create-subagent** - 创建子代理
- **migrate-to-skills** - 迁移到技能系统

## 使用方式

Skills 会在需要时自动激活，或者你可以在提示中明确引用：

```
使用 ui-ux-pro-max skill 帮我设计一个现代化的登录页面
```

## 添加新 Skill

- 使用 `skill-installer` skill 或手动复制到此目录（`.cursor/skills/`）。
- **[vercel-labs/skills](https://github.com/vercel-labs/skills) CLI**：`npx skills add <org/repo>`（如 `npx skills add vercel-labs/agent-skills`），安装到 **`.agents/skills/`** 并为 Cursor、Claude Code 等建 symlink。支持 `--skill <name>` 安装指定技能、`-a cursor` 指定 Cursor。更新：`npx skills update`。
- **Vercel Agent Skills**：`npx skills add vercel-labs/agent-skills` 可安装 vercel-react-best-practices、web-design-guidelines、vercel-composition-patterns 等，两工具共享。详见 `docs/CLAUDE-CURSOR-COLLABORATION.md`。
