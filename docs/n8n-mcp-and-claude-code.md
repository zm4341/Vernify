# n8n-mcp 与 Claude Code 协作文档

本文档说明 Vernify 中 **n8n-mcp**（社区版）的配置、**n8n-skills** 的安装，以及 Cursor 与 Claude Code 在 n8n 工作流上的协作方式。参考 [n8n 官方 Hosting 文档](https://docs.n8n.io/hosting/)。

## 1. n8n-mcp 替换说明

- **原配置**：Cursor 使用 n8n **内置 MCP**（`http://localhost:56789/mcp-server/http`），仅支持 search_workflows / get_workflow_details / execute_workflow，**无法创建或更新 workflow**。
- **当前配置**：已改为社区版 **[czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp)**，通过 `~/.cursor/mcp.json` 的 `n8n-mcp` 条目以 **npx n8n-mcp** 方式运行。
- **能力**：节点/模板搜索、节点详情与文档、配置校验、**创建/更新/删除/执行 workflow**（需配置 N8N_API_URL + N8N_API_KEY）。

## 2. Cursor 侧配置（~/.cursor/mcp.json）

```json
"n8n-mcp": {
  "command": "npx",
  "args": ["n8n-mcp"],
  "env": {
    "MCP_MODE": "stdio",
    "LOG_LEVEL": "error",
    "DISABLE_CONSOLE_OUTPUT": "true",
    "N8N_API_URL": "http://localhost:56789",
    "N8N_API_KEY": "<在 n8n 设置 → n8n API 中创建并粘贴>"
  }
}
```

- **N8N_API_KEY**：在 n8n 界面 **Settings → n8n API** 中创建 API Key，复制后替换上述占位符。请求头为 `X-N8N-API-KEY`（n8n-mcp 内部使用）。
- **本地 n8n**：若 n8n 跑在 Docker（如 `localhost:56789`），`N8N_API_URL` 使用 `http://localhost:56789` 即可。
- 修改后需**重启 Cursor** 或重新加载 MCP 以使配置生效。

## 3. n8n-skills 安装

[n8n-skills](https://github.com/czlonkowski/n8n-skills) 提供 7 个互补技能，用于规范使用 n8n-mcp 建 workflow（表达式语法、MCP 工具用法、工作流模式、校验、节点配置、Code 节点 JS/Python）。

### Claude Code（推荐）

```bash
# 插件方式安装
/plugin install czlonkowski/n8n-skills
```

或通过 Marketplace：`/plugin marketplace add czlonkowski/n8n-skills`，再在列表中安装「n8n-mcp-skills」。

### 手动安装（Claude Code）

```bash
git clone https://github.com/czlonkowski/n8n-skills.git
cp -r n8n-skills/skills/* ~/.claude/skills/
# 重载 Claude Code 后技能自动生效
```

### Cursor / 项目内

- 项目内已提供 **`.agents/skills/n8n-workflow/SKILL.md`**，汇总 n8n-mcp 用法与 n8n-skills 说明；建 workflow 时由 **n8n-workflow** SubAgent 使用 n8n-mcp 工具执行，见 `.cursor/agents/n8n-workflow.md`。
- **斜杠命令**：在 Cursor 对话中输入 **/n8n-workflow**（可带参数，如「建一个 Webhook → Slack workflow」）即可委托 n8n-workflow SubAgent；命令定义见 `.cursor/commands/n8n-workflow.md`。

## 4. Cursor 与 Claude Code 分工

| 场景 | 建议执行方 |
|------|------------|
| 在 Cursor 对话中「建/改/验证 n8n workflow」 | Cursor：委托 **n8n-workflow** SubAgent（使用 n8n-mcp） |
| 在 Claude Code 中建 workflow、用 7 个 n8n-skills | Claude Code：安装 n8n-skills 后直接使用 n8n-mcp |
| 任务交接（Cursor 交给 Claude Code 做 workflow） | Graphiti：Cursor 写 episode，Claude Code 检索后执行 |
| 任务交接（Claude Code 做完写回 Cursor） | Graphiti：Claude Code 写回结果，Cursor 用 graphiti-memory 检索 |

两方共用同一 n8n 实例（如 `http://localhost:56789`）与同一 Graphiti（group_id: vernify），通过 `docs/CLAUDE-CURSOR-COLLABORATION.md` 与 `CLAUDE.md` 的协议交接上下文。

## 5. 安全与参考

- **勿直接编辑生产 workflow**：先复制、在开发环境测试、校验后再部署。
- **n8n 官方 Hosting**：[docs.n8n.io/hosting](https://docs.n8n.io/hosting/)（安装、环境变量、安全、扩展、Queue 等）。

## 6. 相关文件

| 文件 | 说明 |
|------|------|
| `.cursor/rules/n8n-mcp.mdc` | n8n-mcp 使用约定、何时委托 n8n-workflow |
| `.cursor/agents/n8n-workflow.md` | n8n-workflow SubAgent 职责与协作 |
| `.cursor/commands/n8n-workflow.md` | 斜杠命令 /n8n-workflow，供主 Agent 委托 n8n-workflow |
| `.agents/skills/n8n-workflow/SKILL.md` | n8n-mcp 与 n8n-skills 使用要点 |
| `docs/CLAUDE-CURSOR-COLLABORATION.md` | Claude Code × Cursor 总体协作架构 |
