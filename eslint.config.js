// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import pluginPrettier from "eslint-plugin-prettier";
import pluginVitest from "eslint-plugin-vitest";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,mjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            prettier: pluginPrettier,
        },
        rules: {
            "prettier/prettier": "error",
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        files: ["**/*.{test,spec}.js"],
        ...pluginVitest.configs.recommended,
    },
];
