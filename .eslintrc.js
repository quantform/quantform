module.exports = {
    root: true,
    env: {
      node: true,
      jest: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.base.json',
      sourceType: 'module',
      tsconfigRootDir: __dirname
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc', 'simple-import-sort', 'prettier'],
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    rules: {
      'prettier/prettier': 'error',
      complexity: ['error', { max: 10 }],
      'accessor-pairs': ['error'],
      'arrow-body-style': ['error', 'as-needed'],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000'], ['^@?\\w'], ['^@lib(/.*|$)', '^@quantform(/.*|$)'], ['^\\.']]
        }
      ],
      curly: 'error',
      'dot-notation': 'error',
      'no-underscore-dangle': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      "no-restricted-imports": ["error", {
        "patterns": ["../*"]
      }],
      "tsdoc/syntax": "warn"
    },
    ignorePatterns: ['.eslintrc.js']
  };