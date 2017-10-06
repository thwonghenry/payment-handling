const paymentFormHandler = require('../../share/paymentFormHandler');

module.exports = (req, res, next) => {
    const paymentData = req.body;

    const error = paymentFormHandler.validateForm(paymentData);

    if (error !== true) {
        const errorObj = new Error(paymentFormHandler.errorMessageBuilder(error));
        errorObj.statusCode = 400;
        errorObj.meta = error;
        return next(errorObj);
    }
    
    res.send(paymentData);
    next();
};