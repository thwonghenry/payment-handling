// require all gateways in the same folder except this file
// an object with filename as the key, module as the value
const gateways = {
    paypal: require('./paypal'),
    braintree: require('./braintree')
};

// gateway chooser, iterate all the loaded modules, return the one with predicate returns true
module.exports = (data) => {
    for (let gateway in gateways) {
        const handler = gateways[gateway];
        if (handler.predicate && handler.predicate(data)) {
            return handler;
        }
    }
    return null;
};