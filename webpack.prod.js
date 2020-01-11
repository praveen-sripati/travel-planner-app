const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry :  ['@babel/polyfill', './src/client/index.js'],
  output: {
    libraryTarget: 'var',
    library: 'Client'
  },
  mode: 'production',
  devtool: 'source-map',
  stats: 'verbose',
  optimization: {
    minimizer: [new TerserPlugin({parallel: true}), new OptimizeCSSAssetsPlugin({})]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/client/views/index.html",
      filename: "./index.html",
    }),
    new MiniCssExtractPlugin({filename: '[name].css'}),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
    new WorkboxPlugin.GenerateSW()
  ]
}