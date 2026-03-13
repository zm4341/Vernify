#!/bin/sh
# 开发环境入口：挂载 volume 后 node_modules 可能被覆盖为空，
# 需在容器启动时重新安装依赖，否则会报 sh: next: not found
set -e

# 修复 distDir 目录权限
# distDir = /app/.next（命名 volume，覆盖宿主机绑定挂载中的 .next 目录）
# Turbopack 要求 distDir 在 projectPath 内，故用默认 .next
mkdir -p /app/.next
chmod -R 777 /app/.next 2>/dev/null || true
rm -f /app/.next/lock 2>/dev/null || true

if [ ! -f node_modules/.package-lock.json ] 2>/dev/null || [ ! -x node_modules/.bin/next ] 2>/dev/null; then
  echo "Installing dependencies..."
  npm install
fi

# 使用 /tmp 存放 Turbopack 缓存，避免绑定挂载权限问题
export TMPDIR=/tmp
export TURBOPACK_CACHE_DIR=/tmp/.next-turbopack

exec "$@"
