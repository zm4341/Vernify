# /verify — 质量门控

执行 Vernify 项目的完整质量检查。参考：[AGENTS.md](../../AGENTS.md) 质量门控章节。

## 用法

```
/verify           — 完整检查（默认）
/verify quick     — 仅 build + 调试语句
/verify pre-pr    — 完整 + 委托 security-reviewer
```

## 执行步骤

按顺序执行，失败立即停止并报告：

1. **Build** — `cd Web && npm run build`
2. **类型检查** — TypeScript 0 errors（含在 build 中）
3. **Lint** — `cd Web && npm run lint`
4. **FastAPI 测试** — `cd Web/backend && poetry run pytest -v`
5. **调试语句审计** — 检测 `console.log`、`print(`（排除 node_modules/.next）
6. **Git 状态** — 列出未提交文件，提示用户

## 输出格式

```
✅ Build         — passed
✅ TypeCheck     — 0 errors
✅ Lint          — 0 warnings
✅ FastAPI Tests — 12 passed
⚠️  Debug Audit  — 2 console.log (Web/app/page.tsx:42)
📋 Git Status   — 3 files modified
```

## 模式

- `quick`：步骤 1 + 5
- `full`（默认）：全部 6 步
- `pre-pr`：全部 6 步 + 委托 security-reviewer（Task 工具）

## Chrome DevTools 浏览器验证协议

若需浏览器验证（pre-pr 或用户要求），必须遵守：

1. **开启专用浏览器**（chrome-devtools MCP），**禁止直接 navigate 到具体 URL**
2. **告知用户**「专用浏览器已启动，请导航到目标页面后确认」
3. **用户确认**后再进行截图/控制台/网络检查
4. 若是代码修改后验证：先请用户关闭现有浏览器，再重新开启
