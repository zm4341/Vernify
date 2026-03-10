请运行项目的测试并汇报结果。

## 执行步骤

1. **确定范围**
   - 若用户指定了范围（如「扩展服务」「前端」「主后端」「某模块」），只运行对应测试。
   - 若未指定，按以下顺序尝试：
     - 扩展服务（FastAPI）：`cd Web/backend && poetry run pytest`
     - 前端：`cd Web && npm test`（若 package.json 中有 test 脚本）

2. **运行测试**
   - 执行对应命令，捕获 stdout/stderr。
   - 若命令不存在（如前端未配置 test），明确说明并建议可用的测试方式。

3. **Docker 环境检查（必须执行）**
   - Vernify 前后端均在 Docker 中运行，做前端/E2E 验证前**必须先**检查容器状态与日志，不得仅凭浏览器或单元测试下结论。
   - 执行：`cd Web && docker compose ps` 查看各容器是否运行
   - 执行：`docker logs Vernify-frontend --tail 50`、`docker logs Vernify-supabase-auth --tail 30` 等，确认无 `next: not found`、连接拒绝等错误
   - 若容器异常（如 Vernify-frontend 报 `sh: next: not found`），在汇报中注明，并建议排查 Dockerfile/启动命令/volume 挂载

4. **前端/E2E 验证（必须遵守专用浏览器协议）**
   - 若涉及前端改动或用户要求验证页面，运行完单元/集成测试且 Docker 状态正常后，委托 **browser-tester** 进行真实浏览器验证。
   - **协议**：browser-tester 先开启专用浏览器，**不直接 navigate**；等用户导航到目标页面并确认后，再进行截图/控制台/网络检查。
   - 若是代码修改后的验证：须先请用户关闭现有专用浏览器，再重新开启。
   - 默认地址：`http://127.0.0.1:38080/`（Vernify 前后端均在 Docker 中，经 Caddy 统一入口）

5. **汇报**
   - 通过/失败数量
   - 失败用例的名称与错误信息（若有）
   - 前端验证结果（若已执行 Chrome DevTools）
   - 建议的修复方向（若有）；**若要修失败用例**：先按 **systematic-debugging** skill 做根因调查，再给出修复

## 常用命令

```bash
# 扩展服务（FastAPI）全量
cd Web/backend && poetry run pytest -v

# 扩展服务带覆盖
cd Web/backend && poetry run pytest --cov=app -v

# 扩展服务指定文件/用例
cd Web/backend && poetry run pytest tests/integration/test_quiz_submit.py -v
cd Web/backend && poetry run pytest -k "test_health" -v

# 前端（若已配置）
cd Web && npm test
cd Web && npm run test:coverage
```

## 与 Subagent 的配合

- **test-writer**：若需补充测试，可委托其根据策略编写。
- **api-tester**：若需手动验证 API，可委托其用 curl 测试。
- **browser-tester**：**必须**——涉及前端/页面验证时，自动委托其使用 Chrome DevTools MCP 做真实浏览器验证。不得仅跑单元测试就声称完成。

## Chrome DevTools 与 Playwright

- **Chrome DevTools MCP**：本项目 E2E 验证的**首选**，AI 可直接控制浏览器，无需写脚本。
- **Playwright**：可选，用于编写可重复的 E2E 测试脚本（如 CI）。日常验证以 Chrome DevTools 为准。

现在请运行测试并汇报结果。
