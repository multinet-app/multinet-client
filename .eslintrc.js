module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
    '@vue/typescript',
    'plugin:vue/recommended',
    '@vue/typescript/recommended',
  ],

  plugins: [
    'vuetify',
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': ['off'],
    'import/prefer-default-export': ['off'],
    camelcase: 'off',
    'vuejs-accessibility/no-autofocus': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: ['Sidebar'],
    }],
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    ecmaFeatures: {
      modules: true,
    },
  },
};
