# /orchestrate — 多 Agent 编排

按预定义工作流链式调用多个专用 Agent。**7 阶段完整说明**见项目文档 [docs/orchestrate-workflow.md](../../docs/orchestrate-workflow.md)（与 Cursor 统一引用）。

## 用法

```
/orchestrate feature     — 完整功能开发（7阶段）
/orchestrate bugfix      — Bug 修复
/orchestrate refactor    — 重构
/orchestrate security    — 安全审查
/orchestrate code-review — 仅代码 Review
```

---

## feature — 7 阶段工作流

> 参考 Anthropic 官方 `feature-dev` 插件，融合 Vernify 特有上下文（Graphiti / Docker / Supabase）。

### Phase 1：Discovery（需求发现）

**目标**：理解要构建什么

1. 用 TodoWrite 创建 7 阶段清单
2. 若需求不清晰，询问用户：
   - 要解决什么问题？
   - 有哪些约束和要求？
   - 影响哪些模块（Next.js / FastAPI / Supabase / n8n）？
3. 先检索 Graphiti：`search_nodes(query="<需求关键词>", group_ids=["vernify"])`
4. 总结理解并与用户确认

---

### Phase 2：Codebase Exploration（代码库探索）

**目标**：从代码层面理解相关上下文

1. 并行启动 2–3 个 **code-explorer** agents，每个关注不同视角：
   - 示例："找到与 [功能] 相似的已有实现，追踪完整执行路径"
   - 示例："分析 [模块] 的架构层次，包括 Next.js BFF、FastAPI、Supabase 调用链"
   - 示例："梳理现有 [相关功能] 的 UI 模式和测试方式"
2. Agent 返回后，**读取 agent 识别的关键文件**（不超过 10 个）
3. 呈现探索摘要（架构、模式、关键文件清单）

---

### Phase 3：Clarifying Questions（澄清问题）

**目标**：消除所有模糊点，再进入设计

**⚠️ 此阶段不可跳过。**

1. 基于探索结果和原始需求，梳理未明确的方面：
   - 边界情况、错误处理、集成点、向后兼容性
   - Supabase schema 变更？新 FastAPI 路由？n8n workflow 触发？
2. 以清单形式呈现所有问题
3. **等待用户回答后方可进入 Phase 4**

---

### Phase 4：Architecture Design（架构设计）

**目标**：设计多种实现方案，选出最优

1. 并行启动 2–3 个 **code-architect** agents，不同侧重：
   - 最小变更（最大复用现有代码）
   - 清洁架构（可维护性、优雅抽象）
   - 实用平衡（速度 + 质量）
2. 汇总方案，给出推荐理由（结合 Vernify 架构约定）
3. **向用户呈现对比表 + 你的推荐，等待选择**

---

### Phase 5：Implementation（实现）

**目标**：按选定方案构建功能

**⚠️ 必须等待用户明确批准后才能开始编码。**

1. 读取 Phase 2/4 识别的所有相关文件
2. 严格遵循代码库约定（不可变性、Server vs Client Component 等）
3. 实时更新 TodoWrite 进度
4. 遵循 Vernify 约定：
   - 页面/UI 修改通知用户交给 Cursor 处理
   - 所有服务在 Docker 中运行，不用本机 npm/uvicorn
   - Supabase migrations 不修改已应用文件

---

### Phase 6：Quality Review（质量审查）

**目标**：确保代码简洁、DRY、功能正确

1. 并行启动 3 个 **code-reviewer** agents，不同聚焦：
   - 简洁性 / DRY / 可读性
   - Bug / 功能正确性
   - 项目规范 / Vernify 特定检查（Supabase client 使用、LaTeX 错误处理等）
2. 汇总发现，**置信度 < 80% 的问题过滤掉**
3. **向用户呈现问题清单，询问：立即修复 / 稍后修复 / 直接继续**

---

### Phase 7：Summary（总结 + 记忆）

**目标**：记录产出，写入 Graphiti

1. 标记所有 Todo 完成
2. 总结：
   - 构建了什么
   - 关键决策
   - 修改文件清单
   - 建议的后续步骤
3. 写入 Graphiti：`add_memory(episode_body="...", group_id="vernify")`
4. 若有架构变更，更新 `docs/architecture/ARCHITECTURE.md`

---

## 其他工作流

| 工作流 | 链路 |
| -------- | ------ |
| `bugfix` | Phase 1 Discovery → code-explorer → 实现 → 3×code-reviewer → /verify |
| `refactor` | architect → [确认] → code-reviewer → /verify |
| `security` | security-reviewer → code-reviewer → 报告 |
| `code-review` | 3×code-reviewer 并行（简洁/Bug/规范）→ 置信度过滤 → 汇总 |

---

## Handoff Document 格式

每个 Agent 完成后输出：

```markdown
## Handoff: [当前 Agent] → [下一个 Agent]
**Context**: 任务背景
**Findings**: 发现的问题/决策
**Files Modified**: 修改文件列表
**Open Questions**: 待决定事项
**Status**: SHIP / NEEDS WORK / BLOCKED
```

## 并行执行

独立子任务使用 `run_in_background: true` 并行，减少总用时。
