'use strict';
/** Requires */
const path                  = require('path');

const webpack               = require('webpack');
const CleanWebpackPlugin    = require('clean-webpack-plugin');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const CheckerPlugin         = require('awesome-typescript-loader').CheckerPlugin;
const ImageminPlugin        = require('imagemin-webpack-plugin').default;

const p                     = require('./package.json');

/** Constants */
const IS_PRODUCTION     = process.env.NODE_ENV === 'production';

const assetsPath        = path.join(__dirname, 'assets/');
const stylesPath        = path.join(__dirname, 'styles/');

const phaserRoot        = path.join(__dirname, 'node_modules/phaser/build/custom/');

const phaserPath        = path.join(phaserRoot, 'phaser-split.js');
const pixiPath          = path.join(phaserRoot, 'pixi.js');
const p2Path            = path.join(phaserRoot, 'p2.js');

const outputPath        = path.join(__dirname, 'dist');

const templatePath      = path.join(__dirname, 'templates/index.ejs');

/** Helpers */
function includes(array, searchElement) {
  return !!~array.indexOf(searchElement);
}

function exposeRules(modulePath, name) {
  return {
    test: (path) => modulePath === path,
    loader: 'expose-loader',
    options: name
  };
}

function filterNull(array) {
  return array.filter((item) => item !== null);
}

function only(isIt, fn, fail) {
  if (!isIt) {
    return fail !== undefined ? fail() : null;
  }

  return fn();
}

const onlyProd = (fn, fail) => only(IS_PRODUCTION, fn, fail);
const onlyDev = (fn, fail) => only(!IS_PRODUCTION, fn, fail);


module.exports = {
  entry: {
    main: path.join(__dirname, 'src/index.ts')
  },
  output: {
    path: outputPath,
    filename: `js/[name]${onlyProd(() => '.[chunkhash]', () => '')}.js`,
    chunkFilename: `js/[name]${onlyProd(() => '.[chunkhash]', () => '')}.chunk.js`,
    sourceMapFilename: '[file].map',
    publicPath: '/'
  },
  devtool: onlyDev(() => 'source-map', () => ''),
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      pixi:   pixiPath,
      phaser: phaserPath,
      p2:     p2Path,
      assets: assetsPath,
      styles: stylesPath
    }
  },
  plugins: filterNull([
    /** DefinePlugin */
    new webpack.DefinePlugin({
      IS_PRODUCTION:  JSON.stringify(IS_PRODUCTION),
      VERSION:        JSON.stringify(p.version)
    }),

    /** JavaScript */
    onlyProd(() => new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: false
    })),
    
    /** Clean */
    new CleanWebpackPlugin([outputPath]),

    /** TypeScript */
    new CheckerPlugin(),

    /** Images */
    onlyProd(() => new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/
    })),

    /** Template */
    new HtmlWebpackPlugin({
      title:    'Phaser TypeScript boilerplate project',
      template: templatePath
    }),

    /** CSS */
    new ExtractTextPlugin({
      filename: `css/[name]${onlyProd(() => '.[chunkhash]', () => '')}.css`
    }),
    
    /** Chunks */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: (module) => /node_modules/.test(module.resource)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'phaser',
      minChunks: (module) => includes([p2Path, pixiPath, phaserPath], module.resource)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons'
    })
  ]),
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    inline: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true,
      ignored: /node_modules/
    }
  },
  module: {
    rules: [
      /** Assets */
      {
        test: (path) => path.indexOf(assetsPath) === 0,
        loader: 'file-loader',
        options: {
          name: `[path][name]${onlyProd(() => '.[sha256:hash]', () => '')}.[ext]`
        }
      },

      /** CSS */
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'stylus-loader'
          ]
        })
      },

      /** JavaScript */
      exposeRules(pixiPath, 'PIXI'),
      exposeRules(p2Path, 'p2'),
      exposeRules(phaserPath, 'Phaser'),
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
};