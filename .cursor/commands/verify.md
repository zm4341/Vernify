# /verify — 质量门控

执行 Vernify 项目完整质量检查。与 [AGENTS.md](../../AGENTS.md) 质量门控章节、Claude Code `.claude/commands/verify.md` 对齐。

## 用法

```
/verify           — 完整检查（默认 = full）
/verify quick     — 仅步骤 1 + 5
/verify full      — 全部 6 步
/verify pre-pr    — 全部 6 步 + 委托 security-reviewer
```

## 执行步骤（与 AGENTS.md 一致）

按顺序执行，**失败立即停止**并报告。可委托 **docker-expert** 或具备 Shell 的 SubAgent 执行（需在项目根或 Web/ 下运行）：

| 步骤 | 命令/检查 | 失败时 |
|------|-----------|--------|
| 1. Build | `cd Web && npm run build` | 立即停止 |
| 2. 类型检查 | TypeScript 0 errors（含在 build 中）| 按文件/行号报告 |
| 3. Lint | `cd Web && npm run lint` | 修复后继续 |
| 4. FastAPI 测试 | `cd Web/backend && poetry run pytest -v` | 修复后继续 |
| 5. 调试语句审计 | 检测 `console.log`、`print(`（排除 node_modules、.next）| 移除后继续 |
| 6. Git 状态 | 未提交文件列表 | 提示用户 |

## 模式说明

- **quick**：步骤 1 + 5（快速反馈）
- **full**（默认）：全部 6 步
- **pre-pr**：全部 6 步 + 委托 **security-reviewer** SubAgent 做安全扫描

## 注意

- 所有服务在 Docker 中运行；禁止本机 `npm run dev` / `uvicorn`
- Build 失败立即停止，不继续后续步骤
