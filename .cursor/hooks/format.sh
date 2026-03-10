#!/usr/bin/env bash
# Cursor afterFileEdit hook: Agent 编辑文件后运行格式化
# 读取 stdin JSON（file_path, edits, conversation_id, generation_id, hook_event_name, workspace_roots）
# 对修改过的文件运行 prettier（若可用），否则跳过；exit 0 表示成功
# 参考: https://cursor.com/docs/agent/hooks

set -e

# 读取 Cursor 传入的 JSON
INPUT_JSON=""
if [ -t 0 ]; then
  INPUT_JSON="{}"
else
  INPUT_JSON=$(cat)
fi

# 提取 file_path（兼容 jq 或 python）
FILE_PATH=""
if command -v jq &>/dev/null; then
  FILE_PATH=$(printf '%s' "$INPUT_JSON" | jq -r '.file_path // empty')
elif command -v python3 &>/dev/null; then
  FILE_PATH=$(printf '%s' "$INPUT_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path','') or '')" 2>/dev/null || true)
fi

if [ -z "$FILE_PATH" ] || [ "$FILE_PATH" = "null" ]; then
  exit 0
fi

# 项目根目录（hooks 从 .cursor/hooks/ 执行）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# file_path 通常为相对于 workspace root
if [[ "$FILE_PATH" == /* ]]; then
  ABSOLUTE_PATH="$FILE_PATH"
else
  ABSOLUTE_PATH="$PROJECT_ROOT/$FILE_PATH"
fi

if [ ! -f "$ABSOLUTE_PATH" ]; then
  exit 0
fi

# 仅对常见可格式化扩展运行 prettier
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.mdc|*.css|*.html)
    if command -v npx &>/dev/null; then
      (cd "$PROJECT_ROOT" && npx --yes prettier --write "$FILE_PATH" 2>/dev/null) || true
    fi
    ;;
  *)
    # 非 prettier 支持的文件类型，跳过
    ;;
esac

exit 0
