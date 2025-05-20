import js from "@eslint/js";
import globals from "globals";
import {defineConfig, globalIgnores} from "eslint/config";
import * as tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
    // Base JS rules
    js.configs.recommended,

    // TypeScript ESLint recommended rules
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    // Prettier compatibility
    {
        files: ["**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslintPlugin,
            prettier: prettierPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: "module",

            parserOptions: {
                tsconfigRootDir: __dirname,
                project: "./tsconfig.json",
            },
        },
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            ...tseslintPlugin.configs.recommended.rules,
            ...prettierConfig.rules,
            "@typescript-eslint/no-unused-vars": "warn",
            "no-console": "warn",
            "semi": ["error", "always"],
            "quotes": ["error", "single"],
            "prettier/prettier": "error",
        }
    },
    globalIgnores(["**/.eslint.config.mjs"]),
];