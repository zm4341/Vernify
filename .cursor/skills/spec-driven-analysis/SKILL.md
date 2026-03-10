---
name: spec-driven-analysis
description: 在动手写代码前做需求/问题分析，产出规格与验收条件。关注 what/why 在 how 之前。参考 Spec Kit、OpenSpec。接到开发、修复或重构请求时优先使用。
---

# Spec 驱动分析（Spec-Driven Analysis）

在实现任何功能、修复或重构之前，先完成**分析**并产出可验证的规格。**规格先行**：what 和 why 在 how 之前（参考 [Spec Kit](https://github.com/github/spec-kit)）。

## 架构约定（Vernify）

- **主后端**：Next.js（前端 + BFF）；**扩展服务**：FastAPI 仅为 Next 提供 AI/LaTeX 等能力。影响范围分析时区分主后端与扩展服务。

## 何时使用

- 用户提出新功能、改需求、修 Bug、或重构
- 尚未明确「做对的标准」就准备写代码时
- 需要与用户对齐范围或优先级时

## 执行步骤

### 1. 澄清问题与目标

- 用 1～3 句话概括：**要解决什么问题、为谁、达成什么结果**。
- 聚焦 **what**（要什么）和 **why**（为什么），暂不讨论 **how**（技术栈、实现细节）。
- 若需求模糊，向用户追问：场景、边界、优先级（参考 Spec Kit 的 clarify 阶段）。

### 2. 写出验收条件

采用以下任一形式（择一即可，保持简短）：

**Given/When/Then（推荐）**

```
Given [前置条件]
When  [用户/系统动作]
Then  [可观察的结果]
```

**验收清单**

- [ ] 条件 1 满足时，系统表现为 A
- [ ] 条件 2 满足时，系统表现为 B
- [ ] 不满足时，有明确错误或降级行为

### 3. 标出影响范围与模块边界

- **影响范围**：可能涉及的前端/主后端（Next BFF）/扩展服务（FastAPI）/数据库/配置（列表即可）。
- **模块化视角**：哪些模块会受影响？接口是否需要变更？模块间依赖顺序？（参考[模块化编程](https://zh.wikipedia.org/wiki/模块化编程)：高内聚、低耦合）
- **风险**：依赖未就绪、破坏现有行为、性能影响等，一句话说明。

### 4. 输出规格摘要

向后续步骤输出：

- **问题陈述**：一句话
- **验收条件**：Given/When/Then 或清单
- **影响范围**：模块/文件/服务列表（可后续由 Serena 细化）
- **模块与依赖**：受影响模块、接口、依赖顺序（若明显）
- **风险与假设**：简短说明

### 5. 澄清（若规格仍模糊）

- 在进入计划前，若存在 underspecified 区域，先澄清再继续。
- 可追问：边界情况、异常处理、优先级、与现有功能的关系。

## 示例

**用户**：「注册页验证码发不出去，修一下。」

**分析产出**：

- **问题陈述**：注册页点击「发送验证码」后请求失败，用户看不到验证码。
- **验收条件**：
  - Given 用户已输入合法邮箱并点击「发送验证码」
  - When 前端调用 Supabase OTP 接口
  - Then 接口返回成功且用户进入「输入验证码」步骤，无「Invalid credentials」等错误
- **影响范围**：前端注册页、Supabase/Kong 配置、网络与鉴权链路。
- **模块**：`Web/app/register`、`Web/lib/supabase`、Caddy/Kong；接口：Supabase Auth API。
- **风险**：需区分前端 key 与 Kong 配置是否一致。

## 与流程的衔接

- 分析完成后 → **Serena 分析代码结构**（`serena-code-structure`）→ **TDD 计划与实现**（`tdd-plan-and-implement`）。
- 不要跳过分析直接写代码。
- 参考：[Spec Kit - Specify](https://github.com/github/spec-kit)、[OpenSpec - Agree before you build](https://github.com/Fission-AI/OpenSpec)。
