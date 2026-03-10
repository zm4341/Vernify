# /checkpoint — 检查点管理

长任务中定期保存进度，防止上下文超限时丢失工作。

## 用法

```
/checkpoint create [名称]   — 创建检查点
/checkpoint list            — 列出所有检查点（最近 5 个）
/checkpoint verify          — 验证最近检查点完整性
/checkpoint clear           — 清除旧检查点（保留最近 5 个）
```

## 检查点内容

```
[2026-03-08 14:30] checkpoint: auth-refactor-step2
  SHA: abc1234
  Done: 用户认证 API 重构完成
  Next: 更新前端 AuthContext
  Note: JWT 过期时间改为 7d
```

存储：`.claude/checkpoints.log`

## 何时使用

- 上下文窗口超过 **70%** 时
- 完成一个主要功能阶段后
- 切换任务类型前（如从后端切换到前端）
- 任何可能需要回滚的操作前
