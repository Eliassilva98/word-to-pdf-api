export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly'
      },
      ecmaVersion: 'latest'
    },
    rules: {
      'no-undef': 'error',
      'no-console': 'off'
    }
  }
]
