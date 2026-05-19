import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: ['.astro/**', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        fetch: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tsEslintPlugin.configs.recommended.rules,
      indent: ['error', 2],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'sort-imports': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/order': 'off',
      'no-undef': 'off',
    },
  },
  ...astroPlugin.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['**/*.astro'],
    languageOptions: {
      ...config.languageOptions,
      parser: astroParser,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        parser: tsParser,
      },
    },
    rules: {
      ...config.rules,
      indent: ['error', 2],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
    },
  })),
];
