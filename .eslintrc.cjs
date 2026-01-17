/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'next/typescript',
    'prettier', // Must be last: disables ESLint rules that conflict with Prettier
  ],
  ignorePatterns: ['node_modules', '.next', 'out', 'build', 'dist'],
};
