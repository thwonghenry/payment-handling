import path from 'path';
import MinifyPlugin from 'babel-minify-webpack-plugin';

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
    }
};

if (env === 'development') {
    config.devtool = 'inline-source-map';
} else {
    config.plugins = (config.plugins || []).concat([
        new MinifyPlugin()
    ]);
}

export default config;