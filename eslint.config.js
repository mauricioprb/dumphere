import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'public/build/**',
            'public/hot/**',
            'vendor/**',
            'storage/**',
            'bootstrap/cache/**',
            'yjs-server/node_modules/**',
            '.agents/**',
            '.claude/**',
            '.codex/**',
            '.impeccable/**',
        ],
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],

    {
        files: ['**/*.{js,mjs,ts,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2025,
            },
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
            ],
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
        },
    },

    {
        files: ['*.config.{js,ts}', 'yjs-server/**/*.mjs', 'yjs-server/test/**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-console': 'off',
        },
    },

    {
        files: ['tests/Frontend/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },

    prettier,
);
