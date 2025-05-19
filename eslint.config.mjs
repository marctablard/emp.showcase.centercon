import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Ignore test files completely
    globalIgnores: ["**/*.test.ts", "**/*.test.tsx", "**/jest.config.js", "**/jest.setup.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // we are more lax about any-types, especially in regards to Mixins
      "@typescript-eslint/no-empty-object-type": "off", //  Empty Object Types are necessary for specific Mapper<T,K> declarations
      "@typescript-eslint/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_"}, // excluding  unused variables which are prefixed with _ is common practice
        ],
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
];

export default defineConfig({
  extends: [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
      // Ignore test files while Linting
      globalIgnores: ["**/*.test.ts", "**/*.test.tsx", "**/jest.config.js", "**/jest.setup.js"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off", // we are more lax about any-types, especially in regards to Mixins
        "@typescript-eslint/no-empty-object-type": "off", //  Empty Object Types are necessary for specific Mapper<T,K> declarations
        "@typescript-eslint/no-unused-vars": [
              "error",
              { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_"}, // excluding  unused variables which are prefixed with _ is common practice
          ],
        "@typescript-eslint/no-unsafe-function-type": "off",
      },
    },
  ],
});
