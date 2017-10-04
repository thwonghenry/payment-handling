import path from 'path';
import webpack from 'webpack';

const rootDir = path.resolve(__dirname, '../');

const env = process.env.NODE_ENV;

const config = {
    entry: path.resolve(rootDir, 'src', './index.jsx'),
    output: {
        path: path.resolve(rootDir, 'public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?/,
                exclude: ['node_modules'],
                use: [
                    'babel-loader',
                    'eslint-loader' 
                ]
            }
        ]
    }
};

if (env === 'development') {
    config.devtool = 'inline-source-map';
} else {
    config.plugins = (config.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin()
    ]);
}

export default config;