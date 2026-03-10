# Vernify 项目工具使用策略

本文档记录项目开发中各种工具的使用策略和最佳实践。

## 代码搜索与导航

### SemanticSearch vs Serena

| 维度 | SemanticSearch | Serena |
|------|----------------|--------|
| **原理** | 向量相似度语义理解 | LSP 符号分析 |
| **查询方式** | 自然语言问题 | 符号路径、正则表达式 |
| **精确度** | 模糊，需筛选 | 精确 |
| **速度** | 中等 | 快 |
| **适用场景** | 探索、理解概念 | 精确查找、重构 |

### 使用决策树

```
需要搜索代码？
├─ 不知道具体符号名？ → SemanticSearch
│   └─ 用自然语言描述需求
├─ 知道类名/函数名？ → Serena
│   ├─ 查找定义 → find_symbol()
│   ├─ 查找引用 → find_referencing_symbols()
│   └─ 重构代码 → rename_symbol()
└─ 需要正则搜索？ → Serena
    └─ search_for_pattern()
```

### 组合使用示例

**场景：理解并重构 Docker 配置**

```bash
# 1. 用 SemanticSearch 理解架构
"Docker 服务是如何配置的？"
→ 找到 docker-compose.yml 和相关配置

# 2. 用 Serena 精确操作
find_symbol("docker-compose.yml")
→ 读取完整配置

# 3. 用 Serena 查找引用
search_for_pattern("OLLAMA_BASE_URL")
→ 找到所有 Ollama 引用

# 4. 用 Serena 批量替换
replace_content(...) 
→ 移除 Ollama 配置
```

## 浏览器测试工具

### Chrome DevTools MCP vs Playwright

| 维度 | Chrome DevTools MCP | Playwright |
|------|---------------------|------------|
| **功能** | 调试、性能分析、网络检查 | 自动化测试、截图 |
| **适用场景** | 诊断问题、性能优化 | 功能测试、UI 验证 |
| **控制级别** | DevTools 级别 | 页面交互 |

### 使用场景

**Chrome DevTools MCP**:
- 🔍 检查页面 CSS 样式（computed styles）
- 📊 性能分析（trace recording）
- 🌐 网络请求调试
- 🐛 Console 日志分析

**Playwright**:
- 🖱️ 模拟用户交互（点击、输入）
- 📸 截图对比
- ✅ 功能测试
- 🔄 页面导航

## 文档查询（Context7）

### 何时必须用 Context7

- 使用或审查 **Next.js、React、Supabase、FastAPI、Zod、Tailwind、React Query** 等框架/库的 API 时
- 不确定**当前版本**的正确写法、参数、类型时
- 实现新功能前需要**官方示例**或**最佳实践**时

### 使用流程

1. **先解析库 ID**：`resolve-library-id`，传入库名（如 "Next.js"、"Supabase"、"FastAPI"）
2. **再查文档**：`query-docs`，传入库 ID + 具体问题（如 "App Router async params 用法"、"Supabase SSR createServerClient"）

**示例**：
```
1. resolve-library-id: libraryName "Next.js"
2. query-docs: libraryId "/vercel/next.js", query "Next.js 16 中 async params 和 searchParams 的用法"
```

### 本项目常用库

| 库 | 查询场景 |
|----|----------|
| Next.js | App Router、params/searchParams、服务端/客户端组件 |
| React | Hooks、类型、React 19 变更 |
| Supabase | SSR、createServerClient、Auth、Storage |
| FastAPI | 依赖注入、路由、Pydantic |
| Zod | v4 schema、校验、错误处理 |

### 注意

- 每个问题优先调用 Context7 再写实现，避免依赖过时记忆。
- 若 Context7 无该库，再退回到通用文档或 SemanticSearch。

### Graphiti MCP 与 Neo4j

- 使用 **Graphiti MCP** 或 **Neo4j** 时，应先通过 Context7 查询其 API/文档（若 Context7 支持）。
- 若 Context7 无对应库，则参考官方文档：
  - Graphiti：https://help.getzep.com/graphiti/
  - Neo4j：https://neo4j.com/docs/

## 最佳实践

1. **先理解再操作** - SemanticSearch → Serena
2. **精确任务直接用 Serena** - 节省时间
3. **框架/库 API 必查 Context7** - 获取最新文档与示例，再写代码
4. **性能问题用 Chrome DevTools** - 专业分析
5. **功能测试用 Playwright** - 自动化验证

---

## Docker 环境验证

- **Vernify 前后端均在 Docker 中运行**，测试/E2E 验证时必须先检查容器状态与日志，不得仅凭浏览器或单元测试下结论。
- 常用命令：`cd Web && docker compose ps`、`docker logs Vernify-frontend --tail 50`、`docker logs Vernify-supabase-auth --tail 30`
- 默认访问地址：`http://127.0.0.1:38080/`
- 常见错误：`sh: next: not found`（Vernify-frontend 容器内 next 命令不可用）→ 检查 Dockerfile/启动命令/volume 挂载。

**记住**：每个工具都有其最佳适用场景，组合使用效果最佳。
