const Payment = require('payment');
const paymentFormHandler = require('../../share/paymentFormHandler');
const errorConstructor = require('../errorConstructor');

module.exports = (req, res, next) => {
    req.body.cardType = Payment.fns.cardType(req.body.cardNumber);
    const paymentData = req.body;

    // very special case here
    if (paymentData.cardType === 'amex' && paymentData.orderCurrency !== 'USD') {
        const errorObj = errorConstructor('AMEX credit card can only use USD for currency', 400,{ 
            field: 'general',
            reason: 'AMEX credit card can only use USD for currency'
        });
        res.status(errorObj.statusCode).send(errorObj);
        return;
    }

    // we validate once again because client cannot be trusted
    const error = paymentFormHandler.validateForm(paymentData);

    if (error !== true) {
        const errorObj = errorConstructor(paymentFormHandler.errorMessageBuilder(error), 400, error);
        res.status(errorObj.statusCode).send(errorObj);
        return;
    }

    next();
};