const restify = require('restify');
const paymentValidation = require('./server/handlers/paymentValidation');
const gatewayChooser = require('./server/handlers/gatewayChooser');

const server = restify.createServer({
    name: 'payment-service',
    version: '1.0.0'
});

const plugins = restify.plugins;
server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());

server.post('/payment', paymentValidation, gatewayChooser);

server.get(/.*/, plugins.serveStatic({
    'directory': 'public',
    'default': 'index.html'
}));


const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`${server.name} listening at port ${port}`));