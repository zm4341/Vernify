# /plan — 先规划后执行

委托 **planner** SubAgent 制定实施方案，等待确认后执行。

## 用法

```
/plan <功能描述>
/plan <功能描述> --architect   — 架构变更，先调用 architect SubAgent
```

## 流程

1. 委托 **planner** SubAgent 分析需求
2. 输出受影响文件、实施步骤、风险评估
3. **等待用户确认**（`confirm` / `modify: [调整]` / `cancel`）
4. 确认后按步骤执行，完成后 `/verify`

## 适用场景

- 涉及 3+ 文件修改
- 架构层面变更
- 需求模糊需澄清

## 下游

`/plan` → confirm → 执行 → `/verify` → `/orchestrate code-review`
