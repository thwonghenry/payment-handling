const gateways = require('../gateways');
const errorConstructor = require('../errorConstructor');
const redisClient = require('../redisClient');
const getHashFromData = redisClient.getHashFromData; 

module.exports = (req, res, next) => {
    const data = req.body;

    const gateway = gateways(data);
    if (!gateway) {
        const error = errorConstructor('Card type is unsupported', 400, {
            field: 'general',
            reason: 'Card type is unsupported'
        });
        res.status(error.statusCode).send(error);
        return;
    }
    gateway(data, req).then((meta) => {
        const appendedData = Object.assign({}, data, meta);
        // use token to replace credit card data
        delete appendedData.cardExpiry;
        delete appendedData.cardHolder;
        delete appendedData.cardNumber;
        delete appendedData.cardType;

        // use card holder number and payment ID as key, so we can get it later by these two fields
        const key = getHashFromData([data.orderCustomer, meta.paymentID]);
        redisClient.set(`record:${key}`, JSON.stringify(appendedData));

        res.send({ paymentID: meta.paymentID });
        next();
    }).catch((error) => {
        res.status(error.statusCode).send(error);
    });
};