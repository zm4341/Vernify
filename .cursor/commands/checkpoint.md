# /checkpoint — 检查点管理

长任务中定期保存进度。

## 用法

```
/checkpoint create [名称]   — 创建检查点
/checkpoint list            — 列出检查点
/checkpoint clear           — 清除旧检查点（保留最近 5 个）
```

## 何时使用

- 上下文接近上限时
- 完成一个主要阶段后
- 切换任务类型前

## 存储

检查点内容写入 Graphiti（`group_id: vernify`），跨工具可见：

```
add_memory({
  name: "checkpoint: [名称]",
  content: "Done: ... / Next: ... / Note: ...",
  group_id: "vernify"
})
```

这样 Claude Code 也能读取 Cursor 的检查点记录。
