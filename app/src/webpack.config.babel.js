import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import MinifyPlugin from 'babel-minify-webpack-plugin';

const rootDir = path.resolve(__dirname, '../');

const env = process.env.NODE_ENV;

const extractCSS = new ExtractTextPlugin({
    filename: 'public/bundle.css',
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
    },
    plugins: [
        new Dotenv({
            path: env === 'development' ? '../.env' : './.env',
            systemvars: true
        })
    ]
};

if (env === 'development') {
    config.devtool = 'inline-source-map';
} else {
    config.plugins = (config.plugins || []).concat([
        extractCSS,
        new MinifyPlugin()
    ]);
}

export default config;