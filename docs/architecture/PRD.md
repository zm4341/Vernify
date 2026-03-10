# Vernify 产品需求文档（PRD）

> 基于 Serena 代码结构分析 + 项目规范整理，供产品与研发对齐使用。

---

## 1. 产品概述

**Vernify** 是一款教育科技全栈学习平台，面向 K12（四年级至高三）多学科学习，提供课程浏览、课时学习、交互练习与学习进度管理。

- **目标用户**：学生、教师、管理员
- **核心价值**：结构化课程内容 + 动画/交互（Manim、GeoGebra）+ 答题与 AI 批改

---

## 2. 系统边界与架构（从代码结构归纳）

### 2.1 前端（Web）

| 模块 | 路径/入口 | 说明 |
|------|------------|------|
| 页面路由 | `app/page.tsx`, `app/login`, `app/register`, `app/onboarding`, `app/courses`, `app/courses/[id]`, `app/lessons/[slug]` | 首页、登录/注册、选课、课程详情、课时学习 |
| API 客户端 | `lib/api/client.ts` → `api` (courses, lessons, quiz, grading, users, ai) | 统一调用 Next.js API Routes |
| 认证 | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/stores/auth-sync.tsx` | Supabase Auth + Zustand 同步 |
| 状态与数据 | `lib/stores/auth.ts`, `lib/hooks/useApi.ts` | 认证状态、React Query 封装 |

### 2.2 主后端与数据

| 模块 | 说明 |
|------|------|
| Next.js（主后端） | `app/api/v1/`：courses、lessons、quiz、grading、users/me、health；处理所有 /api/v1/*；需 AI/LaTeX 时内部调用 FastAPI |
| FastAPI（扩展服务） | `backend/app/main.py`，仅为 Next.js 提供 AI 批改等能力扩展，不对外暴露 |
| 数据层 | Supabase（PostgreSQL + Auth + PostgREST），RLS 策略在 `supabase/migrations` |

### 2.3 关键用户流程（与路由对应）

1. **未登录**：落地页 → 挑选课程 `/courses` 或 登录/注册
2. **登录后**：默认进入 `/courses` 挑选课程 → `/courses/[id]` 课程详情与课时列表 → `/lessons/[slug]` 学习
3. **首次/偏好**：可选 `/onboarding` 完善学科与年级（与课程目录并存）

---

## 3. 功能清单（当前能力）

- 用户注册、登录、登出（含整页跳转与 session 一致性）
- 课程目录（挑选课程）、课程详情、课时列表
- 课时学习页（课程内容、Quiz、GeoGebra、Manim 等组件）
- 答题提交与进度（quiz submit、progress、my-submissions）
- 批改：待处理、复核、争议、统计（grading API）
- 用户资料与偏好（profiles、onboarding）

---

## 4. 设计规范

- **字体**：统一使用 [LXGW WenKai / 霞鹜文楷](https://github.com/lxgw/LxgwWenKai)（正文与等宽字体）。配置见 `Web/app/globals.css`、`Web/tailwind.config.ts`，规范见 `.cursor/rules/font-lxgw-wenkai.mdc`。

---

## 5. 约束与依赖

- **部署**：Docker Compose，Caddy 反向代理，前端 38080/38443
- **内容**：课程/课时来自数据库（LaTeX 解析在 `Web/backend/app/services/latex_parser/`，通过 Admin 同步至 DB）
- **合规**：禁止修改已应用的数据库迁移；MCP/规则为项目级配置

---

## 6. 后续可扩展方向（建议）

- 学科/年级筛选与课程元数据（metadata）标准化
- 学习报告与仪表盘（基于 progress、grading 数据）
- 教师端：批改工作台、班级/课程管理
- 更多题型与组件（与现有 Quiz*、GeoGebra 体系一致）

---

*文档版本：基于 Serena 分析生成，与当前代码结构一致。*
