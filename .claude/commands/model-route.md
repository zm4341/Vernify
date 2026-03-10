# /model-route — 模型路由

根据任务复杂度推荐最优模型，平衡成本与质量。

## 用法

```
/model-route <任务描述>
/model-route <任务描述> --budget low|med|high
```

## 路由规则

| 模型 | 适用场景 |
|------|----------|
| **haiku** | 注释、格式化、简单重命名、单行修复、文档更新 |
| **sonnet** | 功能实现、调试、测试编写（默认）|
| **opus** | 架构决策、深度 review、安全审计、模糊需求 |

## 决策树

```
确定性低风险？ → haiku
涉及架构/安全/模糊需求？ → opus
其他 → sonnet（默认）
```

## 预算模式

- `--budget low`：优先 haiku，降级 sonnet
- `--budget med`：sonnet 为主（默认）
- `--budget high`：opus 为主

## 示例

```
/model-route 重构用户认证模块
→ opus（安全架构，100% 覆盖率要求）

/model-route 更新 README 文档
→ haiku（确定性低风险）

/model-route 实现题目搜索 API
→ sonnet（标准实现任务）
```
