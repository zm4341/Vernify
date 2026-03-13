使用 **gitnexus** 子代理和 **GitNexus MCP** 完成下面这件事。

（若在 `/gitnexus` 后还有文字，则那段文字就是「下面这件事」——例如：`/gitnexus detect_changes` 表示执行变更范围检查；`/gitnexus query 登录` 表示按「登录」做执行流查询；`/gitnexus impact getLessonBySlug` 表示对符号 getLessonBySlug 做影响分析。）

## 流程概览

| 步骤 | 内容 | 工具 |
|------|------|------|
| 1 | 理解任务 | 明确要做 detect_changes、query、impact、context、rename 等哪一种 |
| 2 | 执行 | 使用 GitNexus MCP（list_repos、query、context、impact、detect_changes、rename、cypher）|
| 3 | 报告 | 向主 Agent 回报结论与必要摘要（影响范围、风险、是否 stale、关键符号/执行流）|

## 常见任务示例

- **任务开始（代码类）**：detect_changes → 若 stale 提示先 `npx gitnexus analyze` → query(任务关键词)
- **改代码前**：impact(target: 符号名, direction: upstream)
- **提交前**：detect_changes(scope: "all" 或 "staged")
- **探索概念**：query(概念或关键词)
- **看某符号引用**：context(name: 符号名[, file_path])

## GitNexus Skills（按任务类型选用）

执行时按任务类型遵循 `.claude/skills/gitnexus/` 下对应 Skill 的 workflow：**gitnexus-exploring**（理解架构）、**gitnexus-impact-analysis**（影响范围）、**gitnexus-debugging**（追踪 Bug）、**gitnexus-refactoring**（重命名/重构）、**gitnexus-guide**（工具与资源）、**gitnexus-cli**（CLI 命令）。

## 参考

- Rule：`.cursor/rules/gitnexus.mdc`
- SubAgent：`.cursor/agents/gitnexus.md`
- **Skills**：`.claude/skills/gitnexus/`（gitnexus-exploring、impact-analysis、debugging、refactoring、guide、cli）
- `task-priority-workflow.mdc`、`AGENTS.md` 内 `<!-- gitnexus:start -->` 块
- [GitNexus](https://github.com/abhigyanpatwari/GitNexus)

---

现在请开始：把「下面这件事」当作当前任务，委托 **gitnexus** SubAgent 使用 GitNexus MCP 完成；若用户未写具体内容，可执行一次 detect_changes 或 list_repos 回报当前索引状态，或提示用户可输入要执行的类型（如 detect_changes、query 某概念、impact 某符号）。
