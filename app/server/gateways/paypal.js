const paypal = require('paypal-rest-sdk');
const redisClient = require('../redisClient');
const hasher = require('../hasher');
const errorConstructor = require('../errorConstructor');
const promisify = require('../promisify');

paypal.configure({
    mode: process.env.PAYPAL_MODE,
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const creditCardCreate = promisify(paypal.creditCard, 'create');
const paymentCreate = promisify(paypal.payment, 'create');

const supportCurrencies = [
    'USD',
    'EUR',
    'AUD'
];

/**
 * Create credit card ID to vault
 * 
 * @param {object} data The payment form data
 * 
 * @return {string} The credit card ID
 */
const createCreditCardID = async (data) => {
    const response = await creditCardCreate({
        number: data.cardNumber.replace(/ /g, ''),
        type: data.cardType,
        expire_month: data.cardExpiry.month,
        expire_year: data.cardExpiry.year
    });
    return response.id;
};

const getCreditCardID = async (hash) => {
    const cachedData = await redisClient.getAsync(`paypal:${hash}`);
    if (!cachedData) {
        return false;
    }
    return cachedData.toString();
};

const createTransaction = async (data, creditCardID) => {
    const paymentData = {
        intent: 'sale',
        payer: {
            payment_method: 'credit_card',
            funding_instruments: [{
                credit_card_token: {
                    credit_card_id: creditCardID
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
    };
    return await paymentCreate(paymentData);
};

module.exports = {
    predicate: (data) => {
        return (
            supportCurrencies.includes(data.orderCurrency) ||
            data.cardType === 'amex' && data.orderCurrency === 'USD'
        );
    },
    /**
     * Pay with Paypal gateway with credit card
     * 
     * 1. Get the credit card token from Paypal vault
     *    - If not exists, create one
     * 2. Pay with the credit card token
     * 
     * @param {object} data The payment form data
     * 
     * @return {object} The "record" data structure
     */
    handler: async (data) => {
        const hash = hasher([
            data.cardNumber,
            data.cardExpiry.month,
            data.cardExpiry.year,
            data.cardCvc
        ]);
        try {
            let creditCardID = await getCreditCardID(hash);
            if (!creditCardID) {
                creditCardID = await createCreditCardID(data);
                redisClient.set(`paypal:${hash}`, creditCardID);
            }
            const response = await createTransaction(data, creditCardID);
            return {
                paymentID: response.id,
                gateway: 'paypal',
                cardToken: creditCardID,
                response
            };
        } catch (error) {
            throw errorConstructor(error.response.message, error.httpStatusCode, {
                field: 'general',
                reason: error.response.message,
                response: error
            });
        }
    }
};