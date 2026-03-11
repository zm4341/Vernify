#!/usr/bin/env bash
# 从 .env 同步 MCP 密钥到 .cursor/mcp.json，之后可直接打开 Cursor，无需每次 source .env。
# 用法：修改 .env 后运行一次 ./sync-mcp-from-env.sh

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"
exec node scripts/sync-mcp-from-env.js
