# Vernify 文档规范

项目文档的放置原则、创建前必做流程与统一更新做法。遵循本规范可避免文档散落、重复与放错位置。

## ⚠️ 核心宗旨

- **主要宗旨**：**不创建重复文档**（primary goal: avoid duplicate documents）。优先修改现有文件，不保留多版本（如 v1、v2、_old、_new）。
- **新建允许**：确有需要时可以创建新文档，但流程须**非常严谨**（very rigorous）：完成创建前必查、分析必要性、记录新建原因等（见第 3 节）。

所有 SubAgent（含 docs-updater、project-updater、post-task-reviewer 等）均须遵循此原则。

## 1. 文档放置原则

**所有文档类文件均放在根目录 `docs/` 下**，不在根目录、Web/ 或其他位置创建文档。`docs/` 为唯一文档根。

- 架构、迁移、规范、设计、样例等均归入 `docs/` 相应子目录
- 新增文档统一放入 `docs/` 对应分类；若需新分类，先查询现有结构再决定

## 2. 修改即替换、单一数据源

- **修改即替换**：更新文档时，用新内容**替换**原文，不保留多个版本（如 v1、v2、_old、_new）。
- **不创建重复文档**：优先修改现有文件；仅当确需新建时，须走非常严谨流程（创建前必查、必要性分析、记录新建原因）。
- **docs/architecture 单一数据源**：

| 主题 | 唯一源 |
|------|--------|
| 整体架构 | ARCHITECTURE.md |
| 产品需求 | PRD.md |
| 技术栈 + 数据流 | TECH-STACK-ANALYSIS.md |
| 模块化 | MODULARIZATION.md |

- **规范文件**：规范文件（见 graphiti-memory.mdc）为 Graphiti 记忆的唯一依据；文档更新后需保证与规范文件一致，便于 Graphiti 整体重构记忆。

## 3. 创建文件前必做（新建须非常严谨）

在创建**任何**新文件前（含文档、Rule、Skill、SubAgent、Command 等），必须：

1. **查询 docs/**：检查 docs/ 下是否已有同类或相关文档，**避免重复**
2. **查询 Graphiti**：检索与主题相关的既有记忆、程序、事实
3. **查询 Serena**：若涉及代码，用 Serena 分析相关结构与放置位置
4. **分析必要性**：明确要创建的文件类型、应放置的路径、与既有内容的关系（是否重复、可复用、为何必须新建）
5. **记录新建原因**：确需新建时，在 MIGRATION.md 或相关文档中记录新建理由

未经上述步骤不得随意创建文件。docs-updater、project-updater 在创建新文件时均遵循此流程。

## 4. 参考

- 文档更新：`.cursor/rules/docs-updater.mdc`、`docs-updater` SubAgent
- 项目维护：`.cursor/rules/project-maintenance.mdc`
- 项目结构：`.cursor/rules/project-structure.mdc` 第 2 节
