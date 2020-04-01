module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
    '@vue/typescript'
  ],
  plugins: [
    'vuetify'
  ],
  rules: {},
  parserOptions: {
    parser: '@typescript-eslint/parser',
    // May need to add back
    // sourceType: 'module', // allow the use of imports statements
    // ecmaVersion: 2018, // allow the parsing of modern ecmascript
  },
};
