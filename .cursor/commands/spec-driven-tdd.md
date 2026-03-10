用 **Spec 驱动 TDD** 流程完成下面这件事。

（若在输入 `/spec-driven-tdd` 后还有文字，则那段文字就是「下面这件事」——例如：`/spec-driven-tdd 修复注册页验证码` 表示要做的是「修复注册页验证码」。）

## 架构约定（Vernify）

- **主后端**：Next.js（前端 + BFF）；**扩展服务**：FastAPI 仅为 Next 提供 AI/LaTeX 等能力。详见 `project-structure.mdc`、`docs/architecture/ARCHITECTURE.md`。

## 编排原则（agent-orchestration）

主 Agent 只负责沟通与拆解；**所有具体操作委托 SubAgent**（code-navigator、tdd-executor、browser-tester、post-task-reviewer 等）。

## 流程概览

请严格按顺序执行，不跳过关键步骤。**规模自适应**：简单修复可走快速路径；复杂功能/跨模块改动必须走完整路径。

| 步骤 | 内容 | 委托/技能 |
|------|------|-----------|
| 1 | **分析** | spec-driven-analysis（主 Agent） |
| 2 | **模块化思维** | 主 Agent 识别模块、接口、依赖 |
| 3 | **Serena 分析** | 委托 **code-navigator** |
| 4 | **计划与 TDD** | tdd-plan-and-implement（主 Agent 制定计划） |
| 5 | **执行与验证** | 委托 **tdd-executor** / **browser-tester** |
| 6 | **任务收尾** | 委托 **post-task-reviewer** |

## 详细步骤

1. **分析**（使用 spec-driven-analysis 技能）  
   澄清需求/问题，写出验收条件（Given/When/Then 或清单）、影响范围与风险。关注 what/why 在 how 之前。

2. **模块化思维**  
   识别受影响模块、接口边界、跨模块依赖；高内聚低耦合，接口与实现分离。

3. **Serena 分析代码结构**  
   **委托 code-navigator** 用 Serena MCP 分析相关文件与符号，明确要改的入口、关键符号与依赖。

4. **计划与 TDD 实现**（使用 tdd-plan-and-implement 技能）  
   主 Agent 制定计划；**委托 tdd-executor** 按任务执行（Red→Green→Refactor）。涉及新建/修改展示页面时按 mdx-evaluation.mdc 评估；**委托 browser-tester** 做前端验证。

5. **执行与验证**  
   **委托 tdd-executor** 跑测试；涉及前端时**委托 browser-tester** 做浏览器验证。Evidence over claims。

6. **任务完成后必做流程**  
   **委托 post-task-reviewer** 执行：Graphiti 检查 → Serena 分析 → 重构 → 更新文档 → 知识同步 → Graphiti 记录。

## 参考

- [Superpowers](https://github.com/obra/superpowers) — 先设计再实现、Evidence over claims、两阶段验收
- [Spec Kit](https://github.com/github/spec-kit) — 规格先行、多阶段精炼
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — 灵活迭代、Brownfield 优先
- [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) — 规模自适应
- [模块化编程](https://zh.wikipedia.org/wiki/模块化编程) — 高内聚低耦合、接口与实现分离

---

现在请开始：把「下面这件事」当作当前要完成的任务，从第 1 步分析做起。
