# Supabase MCP 排查说明

## 1. 部署方式（没有“常驻 Docker 服务”）

- **默认（按需 stdio）**：不在 Docker 里常驻。Cursor 在需要时执行 `docker run ... mcp/supabase`，通过 stdio 通信，用完后容器退出；`docker ps` 里看不到常驻容器是正常的。
- **可选（常驻 HTTP）**：若希望常驻，可起一个长期运行的容器并暴露 HTTP 端点，Cursor 通过 URL 连接。详见 `AI/MCPs/MIGRATION.md` 中 supabase-mcp 的「方式二：常驻 HTTP」。

## 2. 已确认正常的部分

- 镜像已构建：`docker images mcp/supabase` 有 `mcp/supabase:latest`。
- 手动运行正常：在终端执行  
  `docker run --rm -i --add-host=host.docker.internal:host-gateway -e SUPABASE_URL=... -e SUPABASE_SERVICE_KEY=... mcp/supabase`  
  并发送 MCP `initialize` 请求，能收到正确响应（serverInfo "Supabase Database"）。
- 配置已写入：`~/.cursor/mcp.json` 里已有 `supabase` 项，且包含 `command: docker`、`args`、`env`。

## 3. 在 Cursor 里“看不到”或无法调用的可能原因

### 3.1 Cursor 未启用或未连接该 MCP

- 打开 **Cursor → Settings → MCP**（或 **Features → MCP**）。
- 查看列表中是否有 **supabase**，并确认为**已启用**。
- 若存在但报错，尝试对该服务器点 **Restart** / **Reconnect**。
- 若根本没有 supabase，说明 Cursor 未加载该条配置（见下）。

### 3.2 Cursor 启动 MCP 时环境变量未传给 Docker

- 配置里使用 `-e SUPABASE_URL`、`-e SUPABASE_SERVICE_KEY` 表示从**当前进程环境**传入容器。
- 若 Cursor 在 spawn 子进程时没有把 `mcp.json` 里 `supabase.env` 注入到环境，容器内就会拿不到这两个变量，可能导致启动失败或无法连接 Supabase，从而在 Cursor 里表现为“无此 MCP”或连接失败。
- **可做一次验证**：在 `~/.cursor/mcp.json` 里把 supabase 的 `args` 改成**把 URL 和 key 直接写在参数里**（仅用于排查，注意勿提交到公开仓库）：
  - 将  
    `"args": ["run", "--rm", "-i", "--add-host=host.docker.internal:host-gateway", "-e", "SUPABASE_URL", "-e", "SUPABASE_SERVICE_KEY", "mcp/supabase"]`  
    改为（把 `YOUR_URL`、`YOUR_KEY` 换成真实值）：  
    `"args": ["run", "--rm", "-i", "--add-host=host.docker.internal:host-gateway", "-e", "SUPABASE_URL=YOUR_URL", "-e", "SUPABASE_SERVICE_KEY=YOUR_KEY", "mcp/supabase"]`
  - 保存后重启 Cursor，再看 MCP 列表里是否出现 supabase 且能正常调用。若这样能出现，则多半是 Cursor 未注入 `env` 的问题。

### 3.3 Cursor 无法执行 Docker

- Cursor 在启动 MCP 时会执行 `docker run ...`。若：
  - 系统 PATH 里没有 `docker`（例如从启动器打开的 Cursor，未继承终端 PATH），或
  - 当前用户没有权限访问 Docker socket（如 `~/.docker/run/docker.sock`），  
  则子进程会启动失败，Cursor 里就不会出现该 MCP。
- **排查**：在**与 Cursor 同环境**下执行（例如用 Cursor 自带的终端）：  
  `docker run --rm hello-world`  
  若失败，需先解决 Docker 安装/权限/PATH，再试 MCP。

### 3.4 Docker 启动较慢导致超时

- 社区反馈：使用 Docker 的 MCP 若启动超过约 2 秒，Cursor CLI 可能报 “Connection closed”；GUI 一般更宽容。
- 若在 Cursor **图形界面**里 supabase 能出现但偶尔断连，可考虑是否为启动慢导致；当前 supabase-mcp 镜像已做过一次启动优化（去掉无效的 `description` 参数），若仍有问题，可再查 Cursor 是否有 MCP 超时/重试相关设置。

## 4. 建议操作顺序

1. **确认镜像与手动运行**  
   - `docker images mcp/supabase` 有镜像  
   - 在终端用当前 `SUPABASE_URL`、`SUPABASE_SERVICE_KEY` 跑一次 `docker run ... mcp/supabase` 并发送 `initialize`，能收到正常 JSON-RPC 响应。

2. **确认 Cursor 配置与界面**  
   - 打开 **Settings → MCP**，看是否有 **supabase**，并处于启用状态；若有报错，点 Restart。  
   - 若没有 supabase，检查 `~/.cursor/mcp.json` 是否被 Cursor 读取（例如是否改过 MCP 配置路径、多份配置冲突等）。

3. **若仍不出现，尝试内联 env 到 args**  
   - 按 3.2 把 URL 和 key 写进 `args` 里的 `-e SUPABASE_URL=...`、`-e SUPABASE_SERVICE_KEY=...`，保存后重启 Cursor，再查看 MCP 列表与调用是否正常。

4. **确认 Cursor 能跑 Docker**  
   - 在 Cursor 内置终端执行 `docker run --rm hello-world`，确认无权限/PATH 问题。

按上述步骤可区分是“镜像/本地 Docker 问题”还是“Cursor 加载/启动/环境变量”问题；Supabase MCP 本身**已通过 Docker 构建并能在本机手动运行**，无需再“部署”成常驻服务。
