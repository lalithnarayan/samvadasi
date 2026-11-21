// Next 16 ships flat configs; the old FlatCompat wrapper around them recursed and crashed `npm run lint`.
import next from 'eslint-config-next/core-web-vitals'
import ts from 'eslint-config-next/typescript'

const eslintConfig = [
  ...next,
  ...ts,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^(_|ignore)' }],
    },
  },
  {
    // one-off data scripts: `any` from JSON files is fine there
    files: ['scripts/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    ignores: ['.next/', 'node_modules/', 'src/payload-types.ts', 'src/payload-generated-schema.ts', 'src/migrations/**', 'src/app/(payload)/**', 'vidyut-data/', 'public/', 'api/', 'data/'],
  },
]

export default eslintConfig
