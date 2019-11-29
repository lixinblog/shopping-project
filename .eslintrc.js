module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': 0,
    'indent': 0,
    'no-trailing-spaces': 0,
    'no-multi-spaces': 0,
    'arrow-spacing': 0,
    'object-curly-spacing': 0,
    'space-infix-ops': 0,
    'eol-last': 0,
    'key-spacing': 0,
    'block-spacing': 0,
    'brace-style': 0,
    'space-before-blocks': 0,
    'keyword-spacing': 0,
    'template-curly-spacing': 0,
    'comma-dangle': 0,
    'comma-spacing': 0
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
