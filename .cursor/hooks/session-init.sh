#!/usr/bin/env bash
# Cursor beforeSubmitPrompt hook: 注入 Lattice 任务开始必做提醒
# 读取 stdin JSON（conversation_id, generation_id, prompt, attachments, hook_event_name, workspace_roots）
# 输出 stdout JSON，包含 additional_context 字段（Cursor 若支持则注入到 Agent 上下文）
# 参考: https://cursor.com/docs/agent/hooks

set -e

# 读取 Cursor 传入的 JSON（静默吞掉 stdin，避免阻塞）
INPUT_JSON=""
if [ -t 0 ]; then
  INPUT_JSON="{}"
else
  INPUT_JSON=$(cat)
fi

# 任务开始必做提醒（task-priority-workflow、agent-orchestration）
# 第一步必须先 Graphiti 检索，不得跳过
ADDITIONAL_CONTEXT="Lattice 任务开始必做（不得跳过）：第一步必须先委托 graphiti-memory 检索；涉及代码分析时委托 code-navigator(Serena)；上下文不足时读 docs、.cursor Rules。主 Agent 只沟通与委托，不直接操作。"

# 输出 JSON 到 stdout（schema 含 additional_context；Cursor beta 可能暂不解析）
printf '%s\n' "{\"additional_context\": \"${ADDITIONAL_CONTEXT}\"}"
exit 0
