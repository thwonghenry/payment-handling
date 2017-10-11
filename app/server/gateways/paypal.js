const paypal = require('paypal-rest-sdk');
const errorConstructor = require('../errorConstructor');
const promisify = require('../promisify');

paypal.configure({
    mode: process.env.PAYPAL_MODE,
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const supportCurrencies = [
    'USD',
    'EUR',
    'AUD'
];

const paymentFormToRequestData = (data) => ({
    intent: 'sale',
    payer: {
        payment_method: 'credit_card',
        funding_instruments: [{
            credit_card: {
                number: data.cardNumber.replace(/ /g, ''),
                type: data.cardType,
                expire_month: data.cardExpiry.month,
                expire_year: data.cardExpiry.year
            }
        }]
    },
    transactions: [{
        amount: {
            total: data.orderPrice,
            currency: data.orderCurrency
        },
        description: 'Payment description'
    }]
});

const responseToRecordData = (response) => ({
    paymentId: response.id,
    gateway: 'paypal',
    response
});

const createTransaction = (data) => promisify(paypal.payment, 'create')(paymentFormToRequestData(data));

module.exports = {
    predicate: (data) => {
        return (
            supportCurrencies.includes(data.orderCurrency) ||
            data.cardType === 'amex' && data.orderCurrency === 'USD'
        );
    },
    paymentFormToRequestData,
    responseToRecordData,
    /**
     * Pay with Paypal gateway with credit card
     * 
     * @param {object} data The payment form data
     * 
     * @return {object} The "record" data structure
     */
    handler: async (data) => {
        try {
            const response = await createTransaction(data);
            return responseToRecordData(response);
        } catch (error) {
            console.error(JSON.stringify(error, null, '\t'));
            throw errorConstructor(error.response.message, error.httpStatusCode, {
                field: 'general',
                reason: error.response.message,
                response: error
            });
        }
    },
    name: 'paypal'
};