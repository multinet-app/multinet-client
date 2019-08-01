// Read in .env file.
const process = require('process');
require('dotenv').config();

// Grab the port to proxy to.
const flask_serve_port = process.env.FLASK_SERVE_PORT || 5000;

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${flask_serve_port}`,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      }
    }
  }
};
