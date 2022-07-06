/* eslint-disable global-require */
/* eslint-disable no-param-reassign */
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options.compiler = require('vue-template-babel-compiler');
        return options;
      });
  },
};
