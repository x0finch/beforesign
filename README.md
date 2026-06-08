# BeforeSign

签名之前，先看懂链上输入。粘贴交易 hex/JSON、calldata、EIP-712 或交易哈希，自动识别并解析。

## 技术栈

- pnpm workspace monorepo
- TypeScript (strict)，模块内导入使用 `.ts` 扩展名
- 命名：文件名 `snake_case`；函数/变量 `camelCase`；常量 `UPPER_SNAKE_CASE`；类型 `PascalCase`；领域字段 `camelCase`（ESLint 强制）
- TanStack Start + Tailwind (`apps/web`)
- viem + view 包（`@beforesign/view-*`）
- Vitest (TDD)

## 环境变量

复制 `.env.example` 为 `apps/web/.env`：

```
ETHERSCAN_API_KEY=
DEBANK_ACCESS_KEY=
TENDERLY_ACCESS_KEY=
```

未配置 Key 时仍可进行本地解析；对应外部能力会降级。

## 命令

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm dev          # http://localhost:3000
pnpm build
```

## 包结构

| 包 | 说明 |
|----|------|
| `@beforesign/core` | 类型、链配置、Zod schema |
| `@beforesign/detect` | 输入类型识别 |
| `@beforesign/json-render-catalog` | json-render 组件 catalog 与 spec helper |
| `@beforesign/json-render-view` | json-render SpecRenderer 与 React registry |
| `@beforesign/view-calldata` | CalldataCall 树 → json-render spec（`buildCalldataSpec`） |
| `@beforesign/view-tx` / `view-tx-hash` / `view-typed-data` | 各 input kind → json-render spec |
| `@beforesign/clients` | Tenderly / Etherscan / DeBank |
| `@beforesign/orchestrator` | 编排（含风险规则 `runRiskRules`） |
| `@beforesign/web` | 前端 + server functions |
