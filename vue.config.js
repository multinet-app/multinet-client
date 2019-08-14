const fs = require('fs');
const process = require('process');
const path = require('path');
const dotenv = require('dotenv');

const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

// Read in .env file.
const env = dotenv.parse(fs.readFileSync(path.resolve('..', '.env')));
process.env.FLASK_SERVE_PORT = env.FLASK_SERVE_PORT || 5000;

module.exports = {
  configureWebpack: {
    plugins: [
      new VuetifyLoaderPlugin(),
    ],
  },
  devServer: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.FLASK_SERVE_PORT}`,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      }
    }
  }
};
