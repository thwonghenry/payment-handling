const gateways = require('../gateways');
const errorConstructor = require('../errorConstructor');
const PaymentRecord = require('../schema/PaymentRecord');
const redisClient = require('../redisClient');

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
        const meta = await gateway.handler(data, req);
        const record = new PaymentRecord(data.orderCustomer, meta.paymentId);
        record.set('gateway', meta.gateway);
        record.set('response', meta.response);
        record.set('orderPhone', data.orderPhone);
        record.set('orderPrice', data.orderPrice);
        record.set('orderCurrency', data.orderCurrency);
        record.save();

        res.send({ paymentId: meta.paymentId });
    } catch (error) {
        res.status(error.statusCode || 400).send(error);
    }
};