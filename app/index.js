const express = require('express');
const router = require('./server/router');

const server = express();

server.use(express.static('public'));
server.use(express.json());
server.use(router);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`${server.name} listening at port ${port}`));