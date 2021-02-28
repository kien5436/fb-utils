/* eslint-disable sort-keys */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { resolve } = require('path');
const { sync } = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const manifestExtraInfo = require('./src/manifest/manifest-chrome.json');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/index.js',
    'content-scripts/fb-down-story': './src/content-scripts/fb-down-story.js',
    'content-scripts/fb-down-story-2': './src/content-scripts/fb-down-story-2.js',
    'content-scripts/fb-remove-annoyances': './src/content-scripts/fb-remove-annoyances.js',
    'content-scripts/fb-remove-tracking-params': './src/content-scripts/fb-remove-tracking-params.js',
    'content-scripts/fb-stop-next-video': './src/content-scripts/fb-stop-next-video.js',
    'main/popup': './src/main/popup.jsx',
  },
  output: {
    filename: '[name].js',
    publicPath: '/build/',
    path: resolve('build'),
  },
  module: {
    rules: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: { cacheDirectory: true },
      },
    }, {
      test: /\.s?[ac]ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: { url: false },
        },
        'sass-loader',
      ],
    }],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyWebpackPlugin({
      patterns: [{
          from: './src/manifest/manifest.json',
          to: '[name].[ext]',
          transform(content) {

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
          transformPath: (targetPath) => Promise.resolve(targetPath.replace(/src(\\|\/)/, '')),
          transform: (content) => Promise.resolve(JSON.stringify(JSON.parse(content.toString()))),
          cacheTransform: false,
        },
        { from: './src/icons/*', to: '[folder]/[name].[ext]', cacheTransform: true },
        { from: './src/fonts/*.(woff|woff2)', to: '[folder]/[name].[ext]', cacheTransform: true },
      ],
    }),
    new HtmlWebpackPlugin({
      title: '',
      filename: 'main/popup.html',
      template: 'src/main/popup.html',
      inject: false,
      cache: false,
    }),
    new PurgecssPlugin({
      paths: () => sync('./src/**/*', { nodir: true }),
      safelist: ['class', 'icon-'],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      name(module) {

        return module.context.includes('node_modules') ?
          (module.context.includes('preact') ? 'libs/preact' : 'libs/common') :
          'libs/utils';
      },
      cacheGroups: {
        styles: {
          name: 'main/popup',
          test: /\.s?[ac]ss$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: true,
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({ cssProcessorPluginOptions: { preset: ['default', { discardComments: { removeAll: true } }] } }),
    ],
  },
  resolve: { extensions: ['.js', '.jsx', '.scss'] },
  stats: 'minimal',
};