---
name: verification-before-completion
description: 在声称工作完成、修复成功或测试通过之前，必须运行验证命令并确认输出；Evidence over claims。来自 Superpowers。
---

# Verification Before Completion（完成前验证）

## 核心理念

声称完成却未验证，是效率假象，不是诚实。

**原则**：Evidence over claims，始终如此。

## 铁律

```
未提供新鲜验证证据，不得声称完成
```

若未在本轮对话中运行验证命令，不得声称通过。

## 流程

在声称任何状态或表达满意之前：

1. **识别**：什么命令能证明该结论？
2. **执行**：运行完整命令（新执行、非复用上次结果）
3. **读取**：完整输出、退出码、失败数量
4. **验证**：输出是否支持该结论？
   - 否 → 如实说明实际状态并附证据
   - 是 → 附证据后再声称
5. **然后**：才可声称完成

## 交付前必验

- **构建**：交付前必须运行构建命令并确认通过（如 `cd Web && npm run build`）；存在构建错误时应**主动修复**后再交付。
- **已知错误**：Lint、类型错误、已知测试失败等须在交付前修复；不交付带已知 bug 的结果。

## 常见场景

| 声称 | 需要 | 不足 |
|------|------|------|
| 测试通过 | 测试命令输出：0 failures | 上次运行、「应该通过」 |
| Lint 通过 | Lint 输出：0 errors | 部分检查、推测 |
| 构建成功 | 构建 exit 0 | Lint 通过、日志看起来正常 |
| Bug 已修 | 复现用例通过 | 代码已改、假定已修 |
| 需求满足 | 逐条验收清单 | 仅凭测试通过 |
| 可交付 | 构建通过 + 已知错误已修复 | 仅功能完成、未验构建 |

## Red Flags（立即停止）

- 使用「应该」「大概」「似乎」
- 在验证前表达满意（「很好！」「完成！」等）
- 未验证就要 commit/push/PR
- 信任 SubAgent 的「成功」汇报而不核实

## 与 Vernify 流程的配合

- **tdd-executor**：每项任务完成后必须附测试输出证据
- **post-task-reviewer**：收尾前必须确认验证已执行
- **browser-tester**：前端验收必须有截图或控制台输出

## 来源

来自 [Superpowers](https://github.com/obra/superpowers) verification-before-completion。
