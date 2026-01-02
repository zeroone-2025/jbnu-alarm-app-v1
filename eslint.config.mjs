import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  // 1. Next.js & TypeScript 기본 설정 확장
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2. 사용자 정의 규칙 및 무시 설정
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
    rules: {
      // Import 순서 정렬 규칙
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      // 불필요한 any 사용 경고 및 미사용 변수 에러
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // 3. Prettier와 충돌하는 ESLint 규칙 비활성화 (가장 마지막에 위치해야 함)
  prettierConfig,
];

export default eslintConfig;
