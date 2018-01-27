const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const NotifierPlugin = require('webpack-notifier')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const compact = require('lodash.compact')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MinifyPlugin = require('babel-minify-webpack-plugin')
let glob = require('glob')
const rxPaths = require('rxjs/_esm5/path-mapping')

// ------------------------------------------------
// CONSTANTS
// ------------------------------------------------
const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = NODE_ENV === 'production'
const isDev = !isProd

const VENDOR_FILES = glob.sync('./src/vendor/**/*.ts')

// ------------------------------------------------
// common config
// ------------------------------------------------
const common = {
    module: {
        rules: [
            {
                test: /\.(jsx?|tsx?)$/,
                exclude: /(\/node_modules\/|\.test\.tsx?$)/,
                loader: 'awesome-typescript-loader?module=es2015',
            },
            {
                test: /\.(css|scss|sass)$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        `css-loader?importLoaders=3&minimize=${isProd}`,
                        'postcss-loader',
                        'sass-loader',
                        'import-glob-loader',
                    ],
                }),
            },
        ],
    },
    plugins: compact([
        new webpack.optimize.ModuleConcatenationPlugin(),
        new NotifierPlugin({ title: 'Webpack' }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),
        isProd && new MinifyPlugin(),
    ]),
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
            ...rxPaths(),
            '@': path.resolve(__dirname, 'src'),
        },
    },
    devtool: isProd ? 'hidden-source-map' : 'inline-source-map',
}

// ------------------------------------------------
//  main bundle config
// ------------------------------------------------
const main = merge(common, {
    entry: {
        // vendor: VENDOR_FILES,
        app: ['./src/index.ts', './src/index.scss'],
    },
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].bundle.js',
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendor',
        //     filename: 'vendor.bundle.js',
        //     chunks: ['app'],
        // }),
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: './src/index.ejs',
            hash: true,
            inject: false,
            env: NODE_ENV,
        }),
        new ExtractTextPlugin({
            filename: '[name].bundle.css',
        }),
    ],
})

// ------------------------------------------------
//  worker bundle config
// ------------------------------------------------
// const worker = merge(common, {
//     entry: { worker: './src/worker.ts' },
//     output: {
//         path: path.join(__dirname, 'public'),
//         filename: '[name].bundle.js'
//     }
// });

/* expose */
// module.exports = [main, worker];
module.exports = [main]
module.exports.common = common
module.exports.main = main
// module.exports.worker = worker;

