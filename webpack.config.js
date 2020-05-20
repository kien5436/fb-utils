const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // mode: 'development',
  mode: 'production',
  entry: {
    background: './src/background.js',
    'main/popup': './src/main/popup.js',
  },
  output: {
    filename: '[name].js',
    publicPath: '/build/',
    path: resolve('build'),
  },
  module: {
    rules: [{
      test: /\.s?[ac]ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.pug$/,
      use: [{
          loader: 'file-loader',
          options: {
            name: '[folder]/[name].html'
          }
        },
        'pug-html-loader'
      ],
    }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json', to: '[name].[ext]' },
        { from: './src/icons/*', to: 'icons/[name].[ext]' },
      ]
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  }
};