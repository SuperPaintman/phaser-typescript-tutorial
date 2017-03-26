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
/**
 * Determines whether an array includes a certain element.
 * @param  {T[]}  array
 * @param  {T}    searchElement
 * 
 * @return {boolean}
 */
function includes(array, searchElement) {
  return !!~array.indexOf(searchElement);
}

/**
 * Create rule for `expose-loader`, to adds module to the global object with passed name.
 * @param  {string} modulePath
 * @param  {string} name]
 * 
 * @return {Object}
 */
function exposeRules(modulePath, name) {
  return {
    test: (path) => modulePath === path,
    loader: 'expose-loader',
    options: name
  };
}

/**
 * Remove `null` elements from array
 * @param  {T[]} array
 * 
 * @return {T[]}
 */
function filterNull(array) {
  return array.filter((item) => item !== null);
}

/**
 * Invoke `fn` if `isIt` is true, else invoke `fail`.
 * 
 * @param  {boolean}  isIt
 * @param  {function} fn
 * @param  {function} fail
 *
 * @return {any}
 */
function only(isIt, fn, fail) {
  if (!isIt) {
    return fail !== undefined ? fail() : null;
  }

  return fn();
}

/** Helpers (based on `only`) */
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
  devtool: onlyDev(() => 'source-map', () => ''), // Disable sourcemaps on production
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      pixi:   pixiPath,     // alias for 'pixi' library
      phaser: phaserPath,   // alias for 'phaser' library
      p2:     p2Path,       // alias for 'p2' library
      assets: assetsPath,   // alias for `assets/` directory
      styles: stylesPath    // alias for `styles/` directory
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
    new CleanWebpackPlugin([outputPath]), // Clean `dist` directory

    /** TypeScript */
    new CheckerPlugin(),

    /** Images */
    // Minimize images and svg's
    onlyProd(() => new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/
    })),

    /** Template */
    // Auto generation index HTML file
    new HtmlWebpackPlugin({
      title:    'Phaser TypeScript boilerplate project',
      template: templatePath
    }),

    /** CSS */
    // Extract CSS files from `styles/` directory to external CSS file
    new ExtractTextPlugin({
      filename: `css/[name]${onlyProd(() => '.[chunkhash]', () => '')}.css`
    }),
    
    /** Chunks */
    // Create ckunks for:
    //   * other vendor modules
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: (module) => /node_modules/.test(module.resource)
    }),
    //   * phaser modules (p2, PIXI, phaser)
    new webpack.optimize.CommonsChunkPlugin({
      name: 'phaser',
      minChunks: (module) => includes([p2Path, pixiPath, phaserPath], module.resource)
    }),
    //   * webpack's utils
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
      exposeRules(pixiPath, 'PIXI'),     // adds `PIXI` to the global object (window)
      exposeRules(p2Path, 'p2'),         // adds `p2` to the global object (window)
      exposeRules(phaserPath, 'Phaser'), // adds `Phaser` to the global object (window)
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
};
