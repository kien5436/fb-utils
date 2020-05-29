const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

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
    }, {
      test: /\.(woff2?|ttf|eot|svg)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }]
    }, ]
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
      chunks: 'all',
      //   // cacheGroups: {
      //   //   vendors: {
      //   //     chunks: 'initial',
      //   //     name(module) {

      //   //       const moduleName = module.identifier().split('/').reduceRight(item => item.replace(/\.js$/, '')).toLowerCase();

      //   //       return `main/${moduleName}`;
      //   //     },
      //   //     test: /node_modules/,
      //   //     enforce: true,
      //   //   },
      //   // }
    },
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: true,
        extractComments: false,
        terserOptions: {
          ecma: 2015,
        }
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      })
    ],
  }
};