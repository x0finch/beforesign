import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/.output/**",
      "**/node_modules/**",
      "apps/web/.vinxi/**",
      "apps/web/src/routes/posts*",
      "apps/web/src/routes/users*",
      "apps/web/src/routes/deferred*",
      "apps/web/src/routes/redirect*",
      "apps/web/src/routes/api/**",
      "apps/web/src/routes/_pathlessLayout/**",
      "apps/web/src/routes/customScript*",
      "apps/web/src/utils/**",
      "apps/web/src/components/DefaultCatchBoundary.tsx",
      "apps/web/src/components/PostError.tsx",
      "apps/web/src/components/NotFound.tsx",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["snake_case"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["snake_case"],
        },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          format: ["snake_case", "UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["snake_case"],
        },
        {
          selector: "import",
          format: null,
        },
      ],
    },
  },
  {
    files: ["apps/web/**/*.tsx"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["snake_case"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          modifiers: ["exported"],
          format: ["PascalCase", "snake_case"],
        },
        {
          selector: "variable",
          modifiers: ["exported"],
          format: ["PascalCase", "snake_case"],
        },
        {
          selector: "typeLike",
          format: ["snake_case", "PascalCase"],
        },
      ],
    },
  },
);
