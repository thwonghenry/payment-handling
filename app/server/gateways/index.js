// require all gateways in the same folder except this file
// an object with filename as the key, module as the value
const gateways = require('require-dir')();

// gateway chooser, iterate all the loaded modules, return the one with predicate returns true
module.exports = (data) => {
    for (let gateway in gateways) {
        const handler = gateways[gateway];
        if (handler.predicate(data)) {
            return handler.handler;
        }
    }
    return null;
};