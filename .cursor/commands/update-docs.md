使用 **docs-updater** 子代理更新项目文档。

（若在 `/update-docs` 后还有文字，则那段文字就是「变更来源或描述」——例如：`/update-docs 根据 SERENA-CODE-ANALYSIS 修正 ARCHITECTURE 中 FastAPI 挂载说明`）

## 流程概览

| 步骤 | 内容 |
|------|------|
| 1 | 理解变更来源（Serena 报告、架构决策、代码变更等） |
| 2 | 阅读需修改的文档，识别不一致处 |
| 3 | 按事实更新 docs/（含 docs/architecture/ARCHITECTURE.md）等 |
| 4 | 一致性检查；MIGRATION.md 记录 |
| 5 | 委托 graphiti-memory 写入变更摘要 |

## 委托

主 Agent 收到本 Command 后，**必须委托 docs-updater SubAgent**，将「变更来源或描述」作为上下文传入。

## 参考

- Rule：`.cursor/rules/docs-updater.mdc`
- Skill：`.cursor/skills/docs-updater/SKILL.md`
- SubAgent：`.cursor/agents/docs-updater.md`

---

现在请开始：把「变更来源或描述」当作当前任务，委托 docs-updater 完成；若用户未写具体内容，则根据近期变更（Serena 分析、架构调整等）推断需更新的文档并执行。
