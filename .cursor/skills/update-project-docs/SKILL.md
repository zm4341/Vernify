---
name: update-project-docs
description: 项目配置文档更新技能。当技术栈升级、架构调整、功能变更后，使用此 skill 系统性地更新所有项目配置和文档。
---

# 更新项目配置文档

当项目发生重大变更时，系统性地更新所有相关配置文档。

## 触发条件

以下情况应该使用本 skill：

- ✅ 升级主要框架或库（Next.js、React、Python、数据库等）
- ✅ 新增或删除 Docker 服务
- ✅ 修改 API 架构或端点
- ✅ 调整项目目录结构
- ✅ 更新开发规范或约定
- ✅ 环境变量配置变更

## 更新检查清单

### 步骤 1：识别变更范围

回答以下问题：
- 技术栈是否有版本变更？
- 是否新增/删除了服务或模块？
- API 路由是否有变化？
- 开发流程是否调整？
- 是否有新的约定或限制？

### 步骤 2：确定需要更新的文件

根据变更类型，确定影响的配置文件：

| 变更类型 | 需要更新的文件 |
|----------|----------------|
| 技术栈升级 | `project-structure.mdc`, 相关 SubAgent |
| Docker 服务 | `project-structure.mdc`, `docker-expert.md` |
| API 变更 | `api-tester.md`, `project-structure.mdc` |
| 目录结构 | `project-structure.mdc` |
| LLM 配置 | `llm-config.md`, `project-structure.mdc` |
| 前端组件 | `frontend-reviewer.md` |
| 内容编译 | `latex-expert.md` |

### 步骤 3：系统性更新

对每个需要更新的文件：

1. **读取当前内容**
2. **识别需要修改的部分**
3. **更新版本号、配置、说明**
4. **移除过时内容**
5. **添加新的约定或注意事项**

### 步骤 4：验证一致性

检查：
- [ ] 不同文件中的版本号一致
- [ ] 命令示例仍然有效
- [ ] SubAgent 的知识与实际代码匹配
- [ ] 没有遗留过时的引用

### 步骤 5：记录变更

在 `.cursor/MIGRATION.md` 中添加记录：

```markdown
## [日期] - [变更标题]

### 变更内容
- 描述具体变更

### 更新的配置
- 列出修改的文件

### 影响
- 说明影响范围
```

## 更新模板

### 技术栈升级模板

```markdown
## 技术栈

### 前端
- **Next.js**: [版本]
- **React**: [版本]
- **TypeScript**: [版本]
...

### 重要约定
- **[框架名] [版本]**: [新的 API 约定或 breaking changes]
```

### Docker 服务模板

```markdown
### Docker 配置
- 所有服务通过 Caddy 统一入口（http://localhost:38080）
- 当前服务：[列出所有服务]
- 端口映射：[列出端口]
```

### API 端点模板

```markdown
### API 路由
```
[端点路径]  # [说明]
```
```

## 使用示例

```
使用 update-project-docs skill 更新项目配置，反映刚才的 Next.js 16 升级
```

## 输出格式

更新完成后，提供清单：

```
📝 已更新的配置文件：
- .cursor/rules/project-structure.mdc
- .cursor/agents/frontend-reviewer.md
- .cursor/MIGRATION.md

✅ 更新内容：
- Next.js 版本：14.2.3 → 16.1.6
- React 版本：18 → 19
- 新增 async params 约定
- 新增 Zod v4 约定

🔍 验证：配置一致性检查通过
```

保持专业、系统化的更新流程。

## 与 post-task-workflow 的关系

完成配置文档更新后，**必须**执行 **post-task-workflow**（`post-task-workflow.mdc`）：Graphiti 检查 → Serena 分析 → 重构 → 更新文档 → 同步 Rules/Skills/SubAgents/Commands → Graphiti 记录。
