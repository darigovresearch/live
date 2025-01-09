// Webpack configuration for creating a static bundle,
// which can then be deployed and served for browsers

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const baseConfig = require('./base.config.js');
const {
  htmlMetaTags: baseHtmlMetaTags,
  outputDir,
  projectRoot,
} = require('./helpers');

const htmlMetaTags = { ...baseHtmlMetaTags };

delete htmlMetaTags['Content-Security-Policy'];

module.exports = merge(baseConfig, {
  entry: {
    app: './src/index',
  },

  output: {
    publicPath: '_/',
    path: path.resolve(outputDir, '_'),
  },

  plugins: [
    // process and Buffer polyfills are needed for AFrame to work nicely as of
    // 1.1.0
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),

    // Create index.html on-the-fly
    new HtmlWebpackPlugin({
      favicon: path.resolve(projectRoot, 'assets', 'icons', 'favicon.ico'),
      meta: htmlMetaTags,
      template: path.resolve(projectRoot, 'index.html'),
      filename: path.resolve(outputDir, 'index.html'),
      hash: true /* for cache busting */,
      title:
        'Skybrush Live | The Next-generation Drone Light Show Software Suite',
    }),
  ],
});
