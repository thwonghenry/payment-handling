const paymentFormHandler = require('../../share/paymentFormHandler');
const errorConstructor = require('../errorConstructor');

module.exports = (req, res, next) => {
    
    const paymentData = req.body;

    // we validate once again because client cannot be trusted
    const error = paymentFormHandler.validateForm(paymentData);

    if (error !== true) {
        const errorObj = errorConstructor(paymentFormHandler.errorMessageBuilder(error), 400, error);
        res.status(errorObj.statusCode).send(errorObj);
        return;
    }

    next();
};