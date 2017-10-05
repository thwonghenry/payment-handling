import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const rootDir = path.resolve(__dirname, '../');

const env = process.env.NODE_ENV;

const extractCSS = new ExtractTextPlugin({
    filename: 'bundle.css',
    disable: env === 'development'
});

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
        }, {
            test: /\.css$/,
            use: extractCSS.extract({
                use: [
                    'css-loader'
                ],
                fallback: 'style-loader'
            })
        }, {
            test: /\.sass$/,
            use: extractCSS.extract({
                use: [
                    'css-loader',
                    'sass-loader'
                ],
                fallback: 'style-loader'
            })
        }]
    }
};

if (env === 'development') {
    config.devtool = 'inline-source-map';
} else {
    config.plugins = (config.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin(),
        extractCSS
    ]);
}

export default config;