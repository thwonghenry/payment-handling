const gateways = require('../gateways');
const errorConstructor = require('../errorConstructor');
const redisClient = require('../redisClient');
const hasher = require('../hasher');

module.exports = async (req, res) => {
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
    try {
        const meta = await gateway(data, req);
        const appendedData = Object.assign({}, data, meta);
        // don't save credit card info for safety
        delete appendedData.cardExpiry;
        delete appendedData.cardHolder;
        delete appendedData.cardNumber;
        delete appendedData.cardType;

        // use card holder number and payment ID as key, so we can get it later by these two fields
        const key = hasher([data.orderCustomer, meta.paymentID]);
        redisClient.set(`record:${key}`, JSON.stringify(appendedData));
    
        res.send({ paymentID: meta.paymentID });
    } catch (error) {
        res.status(error.statusCode || 400).send(error);
    }
};