# n8n Workflow（n8n-mcp 与 n8n-skills）

本技能说明在 Vernify 中如何通过 **czlonkowski/n8n-mcp** 与 **n8n-skills** 创建、管理、验证 n8n 工作流，以及与 Claude Code 的协作方式。

## 何时使用

- 用户要求「建 n8n 工作流」「用 n8n 自动化」「查 n8n 节点/模板」「验证/部署 workflow」时
- 需要搜索节点、获取节点属性、校验配置、创建/更新/执行 workflow 时

## Cursor 侧：n8n-mcp MCP

- **MCP 名称**：`n8n-mcp`（已替换原 n8n 内置 MCP）
- **来源**：[czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp)
- **配置**：`~/.cursor/mcp.json` 中 `n8n-mcp` 使用 `npx n8n-mcp`，需设置：
  - `MCP_MODE=stdio`
  - `N8N_API_URL`（如 `http://localhost:56789`）
  - `N8N_API_KEY`（在 n8n 设置 → n8n API 中创建）
- **能力**：文档/模板/节点搜索、节点详情、配置校验、**创建/更新/删除/执行 workflow**（需 API 配置）

## n8n-skills（7 个技能）

社区提供的 7 个互补技能，用于规范使用 n8n-mcp 建 workflow。**推荐在 Claude Code 中安装**，与 n8n-mcp 配合使用效果最佳。

- **仓库**：[czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)
- **Claude Code 安装**：`/plugin install czlonkowski/n8n-skills`
- **手动安装**：`git clone` 后 `cp -r n8n-skills/skills/* ~/.claude/skills/`

| 技能 | 触发场景 |
|------|----------|
| n8n Expression Syntax | 写表达式、{{}}、$json/$node、排错 |
| n8n MCP Tools Expert | 搜节点、校验配置、用模板、管理 workflow（最高优先级）|
| n8n Workflow Patterns | 建 workflow、连节点、选架构模式 |
| n8n Validation Expert | 校验失败、解读错误、修配置 |
| n8n Node Configuration | 配节点、属性依赖、AI workflow |
| n8n Code JavaScript | Code 节点里写 JS、webhook 取 body |
| n8n Code Python | Code 节点写 Python、限制与标准库 |

详见项目文档：`docs/n8n-mcp-and-claude-code.md`。

## 委托与分工

- **建/改/验证 workflow**：主 Agent 委托 **n8n-workflow** SubAgent（使用 n8n-mcp 工具执行）
- **Claude Code**：可安装 n8n-skills 后在同一 n8n 实例上建 workflow；与 Cursor 通过 Graphiti 交接上下文

## 安全

- **勿直接改生产 workflow**：先复制、在开发环境测试、校验后再部署
- 官方 Hosting 参考：[docs.n8n.io/hosting](https://docs.n8n.io/hosting/)
