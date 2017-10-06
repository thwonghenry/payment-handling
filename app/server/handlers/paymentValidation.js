const Payment = require('payment');
const paymentFormHandler = require('../../share/paymentFormHandler');

module.exports = (req, res, next) => {
    req.body.cardType = Payment.fns.cardType(req.body.cardNumber);
    const paymentData = req.body;

    const error = paymentFormHandler.validateForm(paymentData);

    if (error !== true) {
        const errorObj = new Error(paymentFormHandler.errorMessageBuilder(error));
        errorObj.statusCode = 400;
        errorObj.meta = error;
        return next(errorObj);
    }

    next();
};