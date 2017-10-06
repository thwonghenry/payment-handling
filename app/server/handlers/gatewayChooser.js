const gateways = require('../gateways');

module.exports = (req, res, next) => {
    const data = req.body;

    const gateway = gateways(data);
    if (!gateway) {
        const error = new Error('Card type is unsupported');
        error.statusCode = 400;
        error.meta = {
            field: 'cardNumber',
            reason: 'is unsupported'
        };
        return next(error);
    }
    gateway(data, req).then((formData) => {
        res.send(formData);
        next();
    }).catch((error) => next(error));
};