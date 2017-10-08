const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const config = require('../src/webpack.config.js');
const compiler = webpack(config);

module.exports = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    historyApiFallback: true
});