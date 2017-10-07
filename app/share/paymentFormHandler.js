// Common form validation for both client and server side

const Payment = require('payment');

const fieldToName = {
    'orderCustomer': 'Customer Name',
    'orderPhone': 'Customer Phone Number',
    'orderPrice': 'Price',
    'orderCurrency': 'Currency',
    'cardHolder': 'Card Holder Name',
    'cardNumber': 'Card Number',
    'cardExpiry': 'Card Expiry',
    'cardCvc': 'Card CVC',
};

const requiredFields = Object.keys(fieldToName);

const errorMaker = (field, reason) => ({ field, reason });

module.exports = {
    validateForm: (formData) => {
        for (let field of requiredFields) {
            const value = formData[field];
            if (!value) {
                return errorMaker(field, 'cannot be empty');
            }
            switch (field) {
            case 'cardNumber':
                if (!Payment.fns.validateCardNumber(value)) {
                    return errorMaker(field, 'is invalid');
                }
                break;
            case 'cardExpiry':
                if (!Payment.fns.validateCardExpiry(value)) {
                    return errorMaker(field, 'is invalid');
                }
                break;
            case 'cardCvc':
                if (!Payment.fns.validateCardCVC(value, formData.cardType)) {
                    return errorMaker(field, 'is invalid');
                }
                break;
            }
        }
        return true;
    },
    errorMessageBuilder: (error) => `${fieldToName[error.field]} ${error.reason}`,
    fieldToName,
    requiredFields
};