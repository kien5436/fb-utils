const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    'main/popup': './src/main/popup.js',
    'content-scripts/fb': './src/content-scripts/fb.js',
    'content-scripts/fb-remove-comments': './src/content-scripts/fb-remove-comments.js',
  },
  output: {
    filename: '[name].js',
    publicPath: '/build/',
    path: resolve('build'),
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: { cacheDirectory: true, }
      }
    }, {
      test: /\.s?[ac]ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: { url: false }
        },
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
        { from: './src/_locales/**', to: '_locales/[folder]/[name].[ext]' },
        { from: './src/icons/*', to: '[folder]/[name].[ext]' },
        { from: './src/fonts/*.(woff|woff2)', to: '[folder]/[name].[ext]' },
      ]
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: true,
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      })
    ],
  }
};