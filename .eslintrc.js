module.exports = {
  root: true,

  env: {
    es2022: true,
  },

  extends: [
    'plugin:vue/base',
    'plugin:vue/recommended',
    'plugin:vuetify/base',
    'plugin:vuetify/recommended',
    'plugin:vue/recommended',
    '@vue/airbnb',
    '@vue/typescript',
    '@vue/typescript/recommended',
  ],

  plugins: [
    'vuetify',
  ],

  rules: {
    'no-console': ['error'],
    'no-debugger': ['error'],
    'vue/max-len': ['off'],
    'import/prefer-default-export': ['off'],
    camelcase: 'off',
    'vuejs-accessibility/no-autofocus': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: ['Sidebar'],
    }],
    'import/extensions': ['error', { ts: 'never', vue: 'always' }],
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.vue'],
      },
    },
  },
};
