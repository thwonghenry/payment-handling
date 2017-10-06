const gateways = require('require-dir')();

module.exports = (data) => {
    for (let gateway in gateways) {
        const handler = gateways[gateway];
        if (handler.predicate(data)) {
            return handler.handler;
        }
    }
    return null;
};