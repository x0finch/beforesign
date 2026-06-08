# BeforeSign — Agent 约定

## 命名（全仓库强制，见 `eslint.config.js`）

| 范畴 | 格式 | 示例 |
|------|------|------|
| 文件名 | `snake_case` | `parse_fn.ts`、`parser_input.tsx` |
| 函数、方法、参数、局部变量 | `camelCase` | `parseInput`、`chainId` |
| 常量 | `UPPER_SNAKE_CASE` | `TX_HASH`、`HASH_RE` |
| 类型、接口 | `PascalCase` | `ParseResult`、`InputKind` |
| 领域对象字段、Zod key、联合字面量 | `camelCase` | `chainId`、`messageEn`、`"txHash"` |
| React 组件（导出函数） | `PascalCase` | `ParserInput`、`AppHeader` |

### 豁免

- TanStack：`Route`、`__root.tsx`
- 配置/生成：`vite.config.ts`、`vitest.config.ts`、`routeTree.gen.ts`
- 外部 API 原始 JSON：在 clients 层用 `Record` 读取后映射为领域 `camelCase`，不要写进 `@beforesign/core` 类型

### 不要

- 文件名用 `camelCase` / `PascalCase`（组件文件也用 `snake_case`，如 `default_catch_boundary.tsx`）
- 领域类型或字段用 `snake_case`（如 ~~`parse_result`~~、`chain_id`）
- 把第三方响应字段直接固化进 core 类型

### 模块导入

TypeScript 模块内导入带 `.ts` / `.tsx` 扩展名。

## UI 组件（coss / @beforesign/ui）

- 所有 coss 组件集中在 `packages/ui`，消费方通过子路径导入，例如 `import { Button } from "@beforesign/ui/button"`
- 主题样式：由 `apps/web/src/styles/app.css` 引入 `@import "@beforesign/ui/styles"`
- **新增组件**（必须在 `packages/ui` 目录执行）：

  ```bash
  cd packages/ui && npx shadcn@latest add @coss/xxx
  ```

- 新增后需在 `packages/ui/package.json` 的 `exports` 中补充对应子路径（如 `"./xxx": "./src/components/xxx.tsx"`）
- 不要在 `apps/web` 安装组件；`components.json` 位于 `packages/ui`
