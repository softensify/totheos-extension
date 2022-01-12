// Copyright(c) 2022 Softensify Pty Ltd.www.softensify.com All rights reserved.

const WebpackNotifierPlugin = require('webpack-notifier');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  devtool: false,
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  mode: 'production',
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
      {
        type: 'javascript/auto',
        test: /\.json$/,
        use: 'json-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  entry: {
    popupStart: './src/popupStart.ts',
    permissionsStart: './src/permissionsStart.ts',
    backgroundStart: './src/backgroundStart.ts'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          comments: false,
          mangle: false,
          compress: {
            unused: true,
            dead_code: true
          },
          output: {
            beautify: true,
            comments: false
          }
        }
      })
    ],
  },
  output: {
    pathinfo: false,
    filename: '[name].js',
    path: path.resolve(__dirname, 'target'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/*.png', to: '[name][ext]' },
        { from: 'src/*.json', to: '[name][ext]' },
        { from: 'src/*.html', to: '[name][ext]' },
      ],
    }),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
  ],
  cache: { type: 'memory' }
});