# Graphiti 写入 Neo4j 排查与配置说明

当 Cursor 调用 Graphiti MCP 的 `add_memory` 后返回「queued for processing」但 Neo4j 里没有数据，通常有下面几类原因。

---

## 1. 当前连的 MCP 用的是 FalkorDB，不是 Neo4j

**现象**：Neo4j 浏览器里查不到节点；FalkorDB 里有数据（若你开了 FalkorDB 的 UI）。

**原因**：Graphiti 默认后端是 **FalkorDB**（Redis 图库）。  
Cursor 的 `~/.cursor/mcp.json` 里配置的是：

```json
"graphiti": { "url": "http://localhost:19283/mcp/" }
```

即 Cursor 只连接「本机已在跑的」Graphiti 服务。若该服务是用**默认**的 FalkorDB 版启动的（例如 `docker compose up` 用的是默认 compose），数据只会进 FalkorDB，**不会进 Neo4j**。

**做法**：改用 **Neo4j 版** 启动 Graphiti，并让 Cursor 指向这个服务（见下文「正确用 Neo4j 的启动方式」）。

---

## 2. 正确用 Neo4j 的启动方式

要保证数据写入 **Neo4j**，需要同时启动 Neo4j 和带 Neo4j 配置的 Graphiti MCP。

### 方式 A：Docker Compose（推荐）

在你本机的 Graphiti 仓库里（例如 `~/AI/MCPs/graphiti/mcp_server`）：

```bash
cd ~/AI/MCPs/graphiti/mcp_server
# 确保有 .env，并设置 NEO4J_PASSWORD、OPENAI_API_KEY（或 GOOGLE_API_KEY 等 LLM）
docker compose -f docker/docker-compose-neo4j.yml up -d
```

- Neo4j 浏览器：<http://localhost:7474>  
- MCP 服务：<http://localhost:8000/mcp/>

把 Cursor 的 Graphiti 地址改成 **8000**（或你映射的端口）：

```json
"graphiti": { "url": "http://localhost:8000/mcp/" }
```

若你希望继续用 19283，可在本机用反向代理或端口转发把 8000 转到 19283，并确保转的是上面这个 Neo4j 版服务。

### 方式 B：本机已有 Neo4j，只起 MCP

Neo4j 已在本机运行（例如 7687）时：

```bash
cd ~/AI/MCPs/graphiti/mcp_server
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=你的密码
uv run main.py --database-provider neo4j --config config/config-docker-neo4j.yaml
# 或使用包含 database.provider: neo4j 的 config.yaml
```

同样确保 Cursor 里 `graphiti.url` 指向这个进程监听的地址（如 `http://localhost:8000/mcp/`）。

---

## 3. Episode 是异步处理，未完成则 Neo4j 无数据

**现象**：已经用 Neo4j 版 compose 启动，Neo4j 也连上了，但 `add_memory` 后仍然没有节点。

**原因**：Graphiti 的 episode 是 **先入队、再异步处理** 的。后台会：

1. 用 LLM 做实体抽取、去重、摘要  
2. 再把结果写入图库（Neo4j 或 FalkorDB）

若其中任一步失败，Neo4j 里就不会出现对应节点。常见情况：

- **LLM 未配置或不可用**：`config` 里用的 `llm.provider`（如 openai、gemini）没有在 `.env` 里设置对应 API key，或 key 错误。
- **限流 429**：并发过高会 429，可把 `.env` 里 `SEMAPHORE_LIMIT` 调低（例如 2～5）再试。
- **Neo4j 连不上**：容器内若用 `bolt://neo4j:7687`，本机直接跑 `main.py` 时要用 `bolt://localhost:7687`，并确保 Neo4j 已启动。

**建议**：看 Graphiti MCP 的**容器或进程日志**，确认是否有报错（LLM 调用失败、Neo4j 连接失败等）。

---

## 4. 快速自检清单

| 项 | 检查 |
|----|------|
| Neo4j 是否在跑 | 浏览器打开 http://localhost:7474，能登录 |
| 当前 Cursor 连的是哪台 MCP | `mcp.json` 里 `graphiti.url` 的端口（如 19283 或 8000） |
| 该端口跑的是否为 Neo4j 版 | 用 Neo4j compose 起的服务，且 `config` 为 `config-docker-neo4j.yaml` |
| LLM 是否可用 | `.env` 里对应 provider 的 API key 已设，且无 429 |
| 是否等过异步处理 | 入队后等几十秒～几分钟，再查 Neo4j |

---

## 5. 小结

- **Neo4j 里没数据** 多半是：① 实际连的是 FalkorDB 版 MCP，或 ② 用的是 Neo4j 版但 episode 异步处理未成功（LLM/Neo4j 配置或限流）。
- **要稳定写进 Neo4j**：用 `docker/docker-compose-neo4j.yml` 启动，Cursor 指向该 MCP（如 `http://localhost:8000/mcp/`），并配好 Neo4j 与 LLM 的 `.env`，必要时查看 MCP 日志排查异步处理失败原因。

如你愿意，我可以根据你当前「是用 Docker 还是本机进程、端口用 8000 还是 19283」给出一份你机器上可直接复制粘贴的启动命令和 `mcp.json` 片段。
