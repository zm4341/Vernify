执行 **post-task-workflow**（任务完成后必做流程）。

**编排原则**：按 `agent-orchestration.mdc`，主 Agent **必须委托 post-task-reviewer** SubAgent 执行，不直接操作。

请委托 post-task-reviewer 严格按以下顺序执行：

## 流程一：变更检查与重构

1. **Graphiti 检查** - 检索本次任务相关记录，确认已做事项与上下文
2. **Serena 分析** - 分析相关代码的符号结构、依赖、引用，识别架构问题
3. **重构** - 根据 Serena 结论进行必要重构；遵循 `refactor-convention.mdc`：简化结构、突出主干、移除冗余，不堆叠补充节点（高内聚低耦合、接口与实现分离）
4. **更新文档** - 委托 docs-updater 更新 docs/（含 docs/architecture/ARCHITECTURE.md）；委托 project-updater 更新 .cursor/ 配置
5. **Graphiti 记录** - 用 add_memory 记录本次变更摘要（本 MCP 无 add_episode）

## 流程二：知识同步

1. **更新配置** - 更新受影响的 Rules、Skills、SubAgents、Commands，使其理解本次变更
2. **记录** - 在 MIGRATION.md 和 Graphiti 中记录配置变更

## 委托

可委托 **post-task-reviewer** SubAgent 执行完整流程。

## 参考

- Rule：`post-task-workflow.mdc`
- Skill：`post-task-workflow`
