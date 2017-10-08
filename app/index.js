const express = require('express');
const router = require('./server/router');

const server = express();

const isDevEnv = process.env.NODE_ENV === 'development';

if (isDevEnv) {
    const webpack = require('webpack');
    const webpackMiddleware = require('webpack-dev-middleware');
    const config = require('./src/webpack.config.js');
    const compiler = webpack(config);

    server.use(webpackMiddleware(compiler, {
        stats: {
            colors: true
        },
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    }));
}

server.use(express.static('public'));
server.use(express.json());
server.use(router);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`${server.name} listening at port ${port}`));