# Graphiti 在 Cursor 中委托 SubAgent 失败时的排查说明

当主 Agent 通过 `mcp_task(subagent_type: graphiti-memory, ...)` 委托 graphiti-memory SubAgent 时出现 **「Client network socket disconnected before secure TLS connection was established」**，可按本文排查。

---

## 结论：失败的不是 Graphiti 连接本身

- **Claude Code 能连上 Graphiti**：Claude Code 在你这台机器上运行，直接按配置（如 `.claude/mcp.json` 或项目 `.mcp.json`）访问 `http://localhost:19283/mcp/`，走的是本机 HTTP，不经过 Cursor 的 SubAgent 链路。
- **Cursor 报错里出现的是「secure TLS connection」**：说明断掉的是**某条 TLS（HTTPS）连接**，而 Graphiti 配置是 **HTTP**（`http://localhost:19283/mcp/`），没有 TLS。因此：
  - 失败的是 **Cursor 用来启动或与 SubAgent 通信的那条链路**（例如 Cursor 后端 / SubAgent 运行服务的 TLS 连接），
  - **不是**「主 Agent 或 SubAgent 连不上 Graphiti（localhost:19283）」这一层。

---

## Cursor 侧实际发生了什么

1. **主 Agent 调用 `mcp_task`**：请求 Cursor 启动名为 `graphiti-memory` 的 SubAgent（定义在 `.cursor/agents/graphiti-memory.md`）。
2. **Cursor 的 Task 机制**：根据 [Cursor 文档](https://cursor.com/docs/agent/subagents)，SubAgent 在独立上下文里运行，并继承父 Agent 的 MCP 工具（含 Graphiti）。也就是说，**一旦 SubAgent 成功启动**，它应能使用你在 `~/.cursor/mcp.json` 里配置的 Graphiti MCP（localhost:19283）。
3. **报错发生在这之前**：在建立「secure TLS connection」时 socket 被断开，说明问题出在 **Cursor 与负责运行/调度 SubAgent 的服务之间的连接**（多为 HTTPS），而不是 SubAgent 连 Graphiti 的 HTTP。

---

## 可能原因（按链路区分）

| 环节 | 说明 |
|------|------|
| Cursor 后端 / SubAgent 服务 | Cursor 通过 TLS 连接自己的后端或 SubAgent 运行环境；网络抖动、超时、服务短暂不可用会导致 TLS 建立失败。 |
| 本机网络 / 代理 / 防火墙 | 若本机或公司网络对出站 HTTPS 有限制、拦截或代理配置异常，可能只影响 Cursor 的这条 TLS，而不影响 Claude Code 直连本机 19283。 |
| 临时性故障 | 偶发连接中断，重试后可能恢复。 |

---

## 建议操作（不改 Graphiti 或 MCP 配置即可做）

1. **先重试**  
   过几分钟再让主 Agent 用 `mcp_task(subagent_type: graphiti-memory, ...)` 执行同一条任务，看是否仍报同一 TLS 错误。

2. **确认 Graphiti 与 Cursor MCP 配置**  
   - 本机 Graphiti 服务：`http://localhost:19283/mcp/` 可访问（例如用 curl 或 Claude Code 能连即表示正常）。  
   - Cursor 使用的 MCP 配置：确认 **`~/.cursor/mcp.json`**（Cursor 读的是用户目录下的配置）里包含 graphiti，且 URL 为 `http://localhost:19283/mcp/`。项目根目录的 `.mcp.json` 仅作参考，Cursor 以 `~/.cursor/mcp.json` 为准。

3. **用斜杠命令绕过当前 TLS 失败**  
   在 Cursor 对话里输入 **`/graphiti-memory`**（或 `/graphiti-memory 具体要做的事`），由你在当前会话里触发「使用 graphiti-memory 子代理」；若 Cursor 通过不同路径执行该命令（例如同一进程内调用），可能不会走刚才失败的那条 TLS 链路，从而能成功执行并写入/检索 Graphiti。成功后，再试一次主 Agent 的 `mcp_task` 委托是否恢复。

4. **网络与代理**  
   若在 VPN/公司网络/代理环境下，可尝试切换网络或暂时关闭代理后重试；若错误只出现在 Cursor 的 SubAgent 调用而 Claude Code 一直能连 Graphiti，则更符合「Cursor 的 TLS 链路受影响」的判断。

---

## 与 Claude Code 的对比（便于记忆）

| 项目 | Claude Code | Cursor（mcp_task 委托 graphiti-memory） |
|------|-------------|----------------------------------------|
| 运行位置 | 本机 / 与你同环境 | 主 Agent 在 Cursor 环境，SubAgent 由 Cursor 调度 |
| 连 Graphiti 的方式 | 本机进程直连 localhost:19283（HTTP） | SubAgent 继承 MCP，连 localhost:19283（HTTP） |
| 可能失败的连接 | 无（直连） | **启动/通信 SubAgent 的 TLS 连接**（在连 Graphiti 之前） |

因此：**Graphiti 本身和「Cursor 里 Graphiti MCP 是否配置正确」不是这次错误的直接原因；先保证 SubAgent 能被 Cursor 正常启动和通信（TLS 建立成功），之后 SubAgent 再用 Graphiti MCP 即可。**

---

## 参考

- `.cursor/rules/graphiti-memory.mdc` — Graphiti 约定与委托 graphiti-memory 的规则  
- `docs/GRAPHITI-USAGE.md` — Graphiti 在 Vernify 中的使用约定  
- [Cursor Subagents 文档](https://cursor.com/docs/agent/subagents) — SubAgent 如何工作、继承 MCP 工具
