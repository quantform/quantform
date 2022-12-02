module.exports = {
  extends: ['next/core-web-vitals', '../../.eslintrc.js'],
  rules: {
    "@next/next/no-html-link-for-pages": ["error", "packages/studio/src/pages"],
    "no-restricted-imports": ["off"],
  }
};
