import { defineConfig } from 'vite-plus'

// Generated output and the downloaded exercise data are not source code.
const ignored = ['**/node_modules/**', 'dist/**', 'exercicios/**']

export default defineConfig({
  lint: {
    ignorePatterns: ignored,
    options: {
      typeAware: true,
      typeCheck: true,
      // Every finding fails: there is no warning tier.
      denyWarnings: true,
    },
    rules: {
      'no-explicit-any': 'error',
      // A cast that narrows a type asserts what the compiler cannot prove; give the value its real type.
      'typescript/no-unsafe-type-assertion': 'error',
      'typescript/no-floating-promises': 'error',
    },
    overrides: [{ files: ['scripts/**', 'treinos/**'], env: { node: true } }],
  },
  fmt: {
    // Written by `pnpm musclewiki`.
    ignorePatterns: [...ignored, 'pnpm-lock.yaml', 'musclewiki/cache.json'],
    singleQuote: true,
    semi: false,
  },
  // `.vite-hooks/pre-commit` runs this. Type-aware lint needs the whole project graph, so the hook
  // checks the repository instead of the staged file list.
  staged: {
    '*': () => 'vp check',
  },
})
