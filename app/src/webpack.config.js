const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const rootDir = path.resolve(__dirname, '../');

const env = process.env.NODE_ENV;

const config = {
    entry: [
        'babel-polyfill',
        'promise-polyfill',
        'whatwg-fetch',
        path.resolve(rootDir, 'src', './index.jsx'),
    ],
    output: {
        path: path.resolve(rootDir, 'public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: ['node_modules'],
            use: [
                'babel-loader',
                'eslint-loader'
            ]
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Payment Service',
            filename: path.resolve(rootDir, 'public', './index.html'),
            template: path.resolve(rootDir, 'src', './index.ejs'),
            minify: env === 'production' ? {
                removeComments: true,
                collapseWhitespace: true
            } : false
        })
    ]
};

if (env === 'development') {
    config.devtool = 'inline-source-map';
} else {
    config.plugins = [
        ...(config.plugins || []),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new MinifyPlugin()
    ];
}

module.exports = config;