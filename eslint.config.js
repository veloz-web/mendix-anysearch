const tseslint = require("typescript-eslint");
const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                // Jest globals
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly",
                // Browser/Mendix globals
                window: "readonly",
                document: "readonly",
                console: "readonly",
                mx: "readonly"
            }
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn"
        }
    }
];
