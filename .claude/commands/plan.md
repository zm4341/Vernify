# /plan — 先规划后执行

委托 planner agent 制定实施方案，等待用户确认后再执行。

## 用法

```
/plan <功能描述>
/plan <功能描述> --model opus   — 复杂架构用 opus + architect
```

## 流程

1. 委托 **planner**（`subagent_type: Plan`）分析需求
2. Planner 输出：受影响文件列表、实施步骤（含依赖顺序）、风险评估
3. **等待用户确认**，planner 不写代码
4. 用户 `confirm` 后按步骤执行

## 适用场景

- 涉及 3+ 文件修改
- 架构层面变更（加 `--model opus` 使用 architect）
- 需求模糊需要澄清
- 任何可能影响现有功能的改动

## 确认格式

```
confirm              — 按原方案执行
modify: [修改说明]    — 调整后执行
cancel               — 取消
```

## 下游

`/plan` → confirm → `/tdd` → `/verify` → `/orchestrate code-review`
