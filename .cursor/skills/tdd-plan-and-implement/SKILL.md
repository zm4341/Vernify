---
name: tdd-plan-and-implement
description: 根据规格与 Serena 分析结果制定 TDD 计划，按 Red-Green-Refactor 执行；任务按依赖排序，含两阶段验收。参考 Superpowers、Spec Kit。
---

# TDD 计划与实现（TDD Plan and Implement）

在完成**分析**和**Serena 代码结构分析**之后，用本技能制定可执行计划并按测试驱动方式实现。参考 [Superpowers](https://github.com/obra/superpowers) 的 writing-plans、[Spec Kit](https://github.com/github/spec-kit) 的 tasks/implement。

## 架构约定（Vernify）

- **主后端**：Next.js（前端 + BFF）；**扩展服务**：FastAPI 仅为 Next 提供 AI/LaTeX 等能力。涉及扩展服务测试时，运行 `cd Web/backend && poetry run pytest`。

## 何时使用

- 已有规格/验收条件和 Serena 结构结论
- 准备拆任务、写测试、写实现时
- 需要保证「每个行为都有测试」时

## 原则

| 原则 | 说明 |
|------|------|
| **YAGNI** | 只实现当前验收条件需要的，不提前做「可能以后会用到」的 |
| **DRY** | 重复出现时再抽公共逻辑，且先有测试保护 |
| **Red-Green-Refactor** | 先红（失败测试）→ 再绿（最小实现）→ 再重构（可选） |
| **Evidence over claims** | 必须有测试通过证据，不得仅声称完成（Superpowers） |
| **依赖有序** | 任务按模块依赖、接口先后排序，被依赖者先做（Spec Kit） |

## 执行步骤

### 1. 制定任务列表

把规格拆成**小任务**，每项 2～5 分钟可完成。格式：

| # | 模块/接口 | 任务 | 测试（先写） | 实现（后写） | 文件/符号 |
|---|-----------|------|----------------|-------------|-----------|
| 1 | auth client | 验证码请求带 anon key | 请求头包含 apikey 的测试 | 确保 client 使用 env 中的 key | `client.ts`, `register/page.tsx` |
| 2 | … | … | … | … | … |

- **模块/接口**：标注任务所属模块或接口，便于按依赖排序。
- **测试**：单元（Jest/Vitest/pytest）或集成/E2E 中至少一种能验证该条验收条件。
- **实现**：能通过上述测试的最小改动。
- **依赖顺序**：模型/接口 → 服务 → 路由/组件；被依赖者在前。

### 2. Red：先写失败测试

- 新增或修改测试，使测试**因「功能尚未实现」或「行为不符合预期」而失败**。
- 运行测试，确认是**预期的失败**（失败原因与任务描述一致），不是环境或用例错误。

### 3. Green：最小实现

- 只做能让当前失败测试通过的**最小**代码修改。
- **涉及框架/库 API**（Next.js、React、Supabase、FastAPI、Zod 等）时，**先查 Context7**（resolve-library-id → query-docs）获取当前版本用法，再写实现。
- 再次运行测试，确认通过；若未通过，修正实现直到通过，不改为「放宽测试」来凑绿。

### 4. Refactor（可选）

- 在测试全绿的前提下，整理重复、命名、结构。
- 每次小步重构后立刻跑测试，保持全绿。

### 5. 两阶段验收（参考 Superpowers subagent-driven-development）

- **阶段一：规格符合度** — 实现是否满足验收条件？有无遗漏或超出范围？
- **阶段二：代码质量** — 命名、结构、可维护性；是否存在明显反模式或重复？

发现问题时在汇报中注明，严重问题需修复后再进入下一步。

### 6. 收尾与验证

- 跑完整测试套件（如 `npm test`、`pytest`）。
- **verification-before-completion**：必须以测试输出或截图作为「通过」的证据，不得仅声称完成。
- 若规格中有前端/交互验收，可委托 **browser-tester** 做一次人工场景验证。
- 多任务时可委托 **tdd-executor** 按任务列表逐项执行并汇报。

## 任务粒度与模块化

- **单元级**：一个函数/组件的一个行为 → 一个任务。
- **集成级**：一条 API 或一个用户流程 → 一个任务。
- **按模块分批**：复杂改动可先完成模块 A 的全部任务，再进入模块 B，保持边界清晰。

## 与子 Agent 的配合

- **tdd-executor**：把任务列表交给它，由它逐项执行「写测试 → 写实现 → 跑测试」并回报结果；可要求其做两阶段验收。
- **browser-tester**：前端或 E2E 验收时，委托其在真实浏览器中验证关键路径。

## 示例

- **验收**：Given 用户已输入邮箱，When 点击「发送验证码」，Then 请求发往 `/auth/v1/...` 且带正确 apikey。
- **任务 1**（模块：supabase client）  
  - 测试：集成测试里对注册接口或前端请求做 mock/真实请求，断言 URL 与 header。  
  - 实现：确保 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 与 Kong 一致，且请求基址经 Caddy。  
- 先写测试并跑红，再改配置/代码跑绿。

## 禁止

- 不写测试就直接写实现（除非用户明确说「只修一个小 typo」等 trivial 变更）。
- 写一个永远通过的测试再改实现「凑绿」——测试必须曾失败且失败原因明确。
- 跳过两阶段验收后直接宣称完成。
