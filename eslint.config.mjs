import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      // Prerendered AVIF/WebP <picture> elements and pre-sized CMS images are intentional.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'media/',
      'visualization/',
      'src/payload-types.ts',
      'src/migrations/',
      'src/app/(payload)/',
      'public/',
    ],
  },
]

export default eslintConfig
