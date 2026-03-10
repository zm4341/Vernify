# Vernify 项目配置总览

快速了解项目的 Cursor 配置和使用方式。

## 📊 配置统计

| 类型 | 数量 | 位置 |
|------|------|------|
| **Rules** | 5 | `.cursor/rules/` |
| **Skills** | 18 | `.cursor/skills/` |
| **SubAgents** | 9 | `.cursor/agents/` |
| **MCP Servers** | 6 | `~/.cursor/mcp.json`（全局）|

## 🎯 核心配置

### Rules（始终生效）

1. **project-structure** - 项目结构、技术栈、命令速查（课时/课程描述用 **MDX** 渲染；新页面按 **mdx-evaluation** 评估是否需 MDX）
2. **project-maintenance** - 配置维护规范
3. **mdx-evaluation** - 新页面必须评估是否用 MDX 渲染（有 Markdown 源且需富格式则用；登录/注册/聊天/Admin 不用）
4. **spec-driven-tdd** - Spec 驱动 TDD：先分析 → Serena 分析代码 → 计划 → 测试驱动实现 ⭐
5. **testing-practices** - 测试实践规范（单元/集成/E2E、命令、覆盖策略）

### 关键 SubAgents（按使用频率）

| SubAgent | 适用场景 | 优先级 |
|----------|----------|--------|
| **frontend-reviewer** | 修改前端代码后 | ⭐⭐⭐ |
| **docker-expert** | Docker 配置、启动问题 | ⭐⭐⭐ |
| **project-updater** | 技术升级、架构调整后 | ⭐⭐ |
| **api-tester** | 测试扩展服务接口 | ⭐⭐ |
| **llm-config** | AI 批改服务问题 | ⭐ |
| **latex-expert** | 课程内容编译（**MDX** 与动画组件） | ⭐ |
| **code-navigator** | 代码搜索导航 | ⭐⭐ |
| **browser-tester** | 页面/E2E 验证 | ⭐⭐ |
| **tdd-executor** | 按 TDD 任务列表执行 | ⭐ |
| **test-writer** | 编写/补充单元与集成测试 | ⭐ |

### Spec 驱动 TDD 流程（开发/修复/重构必走）

1. **分析**（spec-driven-analysis）：澄清需求，写出验收条件（Given/When/Then 或清单）；what/why 在 how 之前
2. **模块化思维**：识别受影响模块、接口边界、依赖顺序；高内聚低耦合
3. **Serena 分析**（serena-code-structure）：用 Serena 看相关符号、依赖、引用
4. **计划**（tdd-plan-and-implement）：按依赖拆成小任务，每项「测试 → 实现」；任务标注模块/接口
5. **TDD 执行**：Red → Green → Refactor；两阶段验收（规格符合度、代码质量）
6. **验证**：Evidence over claims；跑测试；前端/E2E 可委托 **browser-tester**，多任务可委托 **tdd-executor**
7. **Docker 环境**：Vernify 前后端均在 Docker 中运行。前端验证前**必须先**检查 `docker compose ps`、`docker logs Vernify-frontend`，不得仅凭浏览器下结论。访问地址：`http://127.0.0.1:38080/`

参考：Superpowers、Spec Kit、OpenSpec、BMAD、模块化编程

### 实用 Skills

| Skill | 用途 |
|-------|------|
| **ui-ux-pro-max** | UI/UX 设计指导 |
| **update-project-docs** | 系统更新项目文档 |
| **create-rule** | 创建新的 Cursor 规则 |
| **spec-driven-analysis** | 需求分析，产出规格与验收条件 |
| **serena-code-structure** | Serena 分析代码结构 |
| **tdd-plan-and-implement** | TDD 计划与 Red-Green-Refactor 实现 |
| **test-coverage-strategy** | 测试覆盖策略（选择单元/集成/E2E、优先级） |
| **database-supabase** | 使用 Supabase MCP 做数据库查询、验证与数据修复 |
| **supabase-postgres-best-practices** | Postgres 性能与最佳实践（查询、索引、RLS、连接池等） |
| **vercel-react-best-practices** | React/Next.js 性能与最佳实践（Context7 注册表） |
| **ai-sdk** | Vercel AI SDK（streamText、useChat、Agent、流式、STT/TTS）；Marketplace 安装，`.agents/skills/ai-sdk` |
| **web-design-guidelines** | Web Interface Guidelines 审查（可访问性、设计审计，Context7 注册表） |
| **frontend-design** | 生产级前端界面与差异化审美（anthropics/skills，Context7 注册表） |
| **systematic-debugging** | 系统化调试（四阶段、根因追溯、防御分层，来自 obra/superpowers） |

### 工具与文档（必用）

- **Context7**：查框架/库最新文档（Next.js、React、Supabase、FastAPI 等）。实现或审查涉及这些 API 时**优先查 Context7**，再写代码。详见 `.cursor/tools-strategy.md`。

## 🚀 使用方式

### 自动触发
AI 会根据任务自动选择合适的 SubAgent，无需手动指定。

### 手动调用
```
使用 frontend-reviewer 审查刚才的组件代码
使用 docker-expert 排查容器启动失败
使用 project-updater 更新配置文档
使用 test-writer 给某 API 补充集成测试
/run-tests   # 运行测试并汇报结果
```

### 使用 Skill
```
使用 ui-ux-pro-max skill 设计一个登录页面
使用 update-project-docs skill 更新项目配置
```

## 📝 维护流程

### 何时更新配置

- ✅ 技术栈升级
- ✅ 新增/删除服务
- ✅ API 路由变更
- ✅ 开发规范调整

### 更新哪些文件

1. **project-structure.mdc** - 版本号、架构、命令
2. **相关 SubAgent** - 知识库同步
3. **MIGRATION.md** - 记录变更

### 谁来维护

**project-updater** SubAgent 会在检测到重大变更后主动更新配置文档。

## 📚 文档说明

- `README.md` - 本文件，配置总览
- `SUMMARY.md` - 快速参考（本文件）
- `MIGRATION.md` - 详细变更历史
- `rules/*.mdc` - 项目规则
- `agents/README.md` - SubAgent 使用说明
- `skills/README.md` - Skill 说明

---

**提示**：项目配置会随着开发自动维护，始终保持最新状态。
