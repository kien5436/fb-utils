const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const manifestExtraInfo = require('./src/manifest/manifest-chrome.json');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    'main/popup': './src/main/popup.js',
    'content-scripts/fb-down-story': './src/content-scripts/fb-down-story.js',
    'content-scripts/fb-stop-next-video': './src/content-scripts/fb-stop-next-video.js',
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
      patterns: [{
          from: './src/manifest/manifest.json',
          to: '[name].[ext]',
          transform: content => {

            const manifest = JSON.parse(content.toString());

            for (const key in manifestExtraInfo)
              manifest[key] = manifestExtraInfo[key];

            return Promise.resolve(JSON.stringify(manifest));
          },
          cacheTransform: false,
        },
        {
          from: './src/**/messages.json',
          to: '[path]/[name].[ext]',
          transformPath: targetPath => Promise.resolve(targetPath.replace('src/', '')),
          transform: content => Promise.resolve(JSON.stringify(JSON.parse(content.toString()))),
          cacheTransform: false,
        },
        { from: './src/icons/*', to: '[folder]/[name].[ext]', cacheTransform: true, },
        { from: './src/fonts/*.(woff|woff2)', to: '[folder]/[name].[ext]', cacheTransform: true, },
      ]
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      name(module) { return 'libs' }
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