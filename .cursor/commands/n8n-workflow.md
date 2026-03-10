执行 **n8n 工作流** 创建、更新、验证或执行。

（若在 `/n8n-workflow` 后带参数，则按参数执行；否则按用户后续描述执行。）

## 编排原则

按 `agent-orchestration.mdc`、`n8n-mcp.mdc`，主 Agent **必须委托 n8n-workflow** SubAgent 执行，不直接调用 n8n-mcp 工具完成整条链路。

## 适用任务

- 创建新 workflow、从模板部署
- 更新已有 workflow（增删改节点、连线）
- 校验 workflow 或节点配置
- 执行/测试 workflow、查看执行结果
- 搜索节点或模板、获取节点属性与文档

## 默认流程

1. **理解需求**：从用户或命令参数中提取目标（例如：建一个 Webhook → Slack 的 workflow、按某模板部署、修复某 workflow 的校验错误）
2. **委托 n8n-workflow**：将完整需求与可选上下文（workflow ID、模板 ID、n8n 实例 URL 等）交给 n8n-workflow SubAgent
3. **汇总反馈**：向用户汇报 SubAgent 返回的摘要（已执行操作、workflow ID、校验结果、执行结果或错误信息）

## 可选参数示例

- `/n8n-workflow 建一个 Webhook 收到请求后发 Slack 通知`
- `/n8n-workflow 按模板 2414 部署`
- `/n8n-workflow 校验 workflow 并修复错误`
- `/n8n-workflow 执行 workflow [id]`

## 前置条件

- **n8n-mcp** 已在 `~/.cursor/mcp.json` 中配置为 `n8n-mcp`，且已设置 `N8N_API_URL`、`N8N_API_KEY`（在 n8n 设置 → n8n API 中创建），才能创建/更新/执行 workflow；仅文档与校验可不配 API。

## 参考

- Rule：`n8n-mcp.mdc`
- SubAgent：`.cursor/agents/n8n-workflow.md`
- Skill：`.agents/skills/n8n-workflow/SKILL.md`
- 协作文档：`docs/n8n-mcp-and-claude-code.md`

请按用户意图委托 n8n-workflow SubAgent 执行。
