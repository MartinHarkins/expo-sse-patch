module.exports = {
  root: true,
  extends: ['universe/native', 'plugin:prettier/recommended'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'prettier/prettier': [
      'error',
      {
        // https://prettier.io/docs/en/options
        endOfLine: 'lf',
        printWidth: 120,
        singleQuote: true,
        tabWidth: 2,
        semi: false,
      },
    ],
  },
}
