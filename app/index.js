const express = require('express');

const server = express();

const promisify = require('./server/promisify');

const isDevEnv = process.env.NODE_ENV === 'development';

const dbInit = require('./server/db/init');
const router = require('./server/router');

(async () => {
    await Promise.all([
        dbInit(),
        (async() => {
            if (isDevEnv) {
                const devMiddleware = require('./server/devMiddleware');
                await new Promise((resolve) => {
                    devMiddleware.waitUntilValid(resolve);
                });
                server.use(devMiddleware);
                console.log('webpack done');
            }
        })()
    ]);
    server.use(express.static('public'));
    server.use(express.json());
    server.use(router);
    const port = process.env.PORT || 8000;

    await promisify(server, 'listen')(port);
    console.log(`${server.name} is up!`);
})();
