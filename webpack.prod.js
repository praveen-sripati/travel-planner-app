const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry : './src/client/index.js',
  mode: 'production',
  devtool: 'source-map',
  stats: 'verbose',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  }
}