import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/.output/**",
      "**/node_modules/**",
      "apps/web/.vinxi/**",
      "**/routeTree.gen.ts",
      "**/*.gen.ts",
    ],
  },
  {
    plugins: { unicorn },
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "snakeCase",
          ignore: [
            String.raw`^__root\.tsx$`,
            String.raw`^routeTree\.gen\.ts$`,
            String.raw`^vite\.config\.ts$`,
            String.raw`^vitest\.config\.ts$`,
            String.raw`^vitest\.workspace\.ts$`,
            String.raw`^review-demo\.tsx$`,
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "import", format: null },
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          format: ["UPPER_CASE", "camelCase"],
        },
        { selector: "function", format: ["camelCase"] },
        { selector: "parameter", format: ["camelCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
        { selector: "typeProperty", format: ["camelCase"] },
        {
          selector: "objectLiteralProperty",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          filter: {
            regex:
              "^(Route|charSet|__html|_html|Content-Type|AccessKey|defaultPreload|defaultErrorComponent|defaultNotFoundComponent|scrollRestoration|routeTree|errorComponent|notFoundComponent|shellComponent|head|component|loader|beforeLoad|server|handlers|GET|POST|children|data-testid)$",
            match: false,
          },
        },
        {
          selector: "variable",
          filter: { regex: "^Route$", match: true },
          format: ["PascalCase"],
        },
      ],
    },
  },
  {
    files: ["apps/web/**/*.tsx"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "import", format: null },
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "function",
          modifiers: ["exported"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "variable",
          modifiers: ["exported"],
          format: ["PascalCase", "camelCase", "UPPER_CASE"],
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "parameter", format: ["camelCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "typeProperty", format: ["camelCase"] },
        {
          selector: "objectLiteralProperty",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          filter: {
            regex:
              "^(Route|charSet|Content-Type|AccessKey|defaultPreload|defaultErrorComponent|defaultNotFoundComponent|scrollRestoration|routeTree|errorComponent|notFoundComponent|shellComponent|head|component|loader|beforeLoad|server|handlers|GET|POST|children|data-testid|className|suppressHydrationWarning|lang|rel|href|name|content|title|meta|links|dangerouslySetInnerHTML|type|onClick|activeProps|params|to)$",
            match: false,
          },
        },
        {
          selector: "variable",
          filter: { regex: "^Route$", match: true },
          format: ["PascalCase"],
        },
      ],
    },
  },
  {
    files: ["apps/web/src/routes/api/**/*.ts"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "import", format: null },
        {
          selector: "objectLiteralMethod",
          filter: { regex: "^(GET|POST|PUT|DELETE|PATCH)$", match: true },
          format: null,
        },
        {
          selector: "objectLiteralProperty",
          filter: {
            regex: "^(Content-Type|Cache-Control|Connection)$",
            match: true,
          },
          format: null,
        },
      ],
    },
  },
  {
    files: [
      "apps/web/src/routes/ai.tsx",
      "apps/web/src/routes/api/ai/**/*.ts",
      "apps/web/src/components/ai/**/*.tsx",
      "apps/web/src/server/ai/**/*.ts",
      "apps/web/src/hooks/use_ask.ts",
      "packages/agent/**/*.ts",
      "packages/ai-pipeline/src/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@beforesign/orchestrator",
              message: "/ai path must not import orchestrator; use @beforesign/ai-pipeline.",
            },
          ],
        },
      ],
    },
  },
);
