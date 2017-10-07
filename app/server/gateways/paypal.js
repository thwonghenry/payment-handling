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

const createCreditCardID = async (data, hash) => {
    try {
        const response = await creditCardCreate({
            number: data.cardNumber.replace(/ /g, ''),
            type: data.cardType,
            expire_month: data.cardExpiry.month,
            expire_year: data.cardExpiry.year
        });
        redisClient.set(`vault:${hash}`, response.id);
        return response.id;
    } catch (error) {
        throw errorConstructor(error.response.message, error.httpStatusCode, {
            field: 'general',
            reason: error.response.message
        });
    }
};

const getCreditCardID = async (data) => {
    const hash = hasher([
        data.cardNumber,
        data.cardExpiry.month,
        data.cardExpiry.year,
        data.cardCvc
    ]);
    const cachedData = await redisClient.getAsync(`vault:${hash}`);
    if (!cachedData) {
        return await createCreditCardID;
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
    try {
        const response = await paymentCreate(paymentData);
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
};

module.exports = {
    predicate: (data) => {
        return (
            supportCurrencies.includes(data.orderCurrency) ||
            data.cardType === 'amex' && data.orderCurrency === 'USD'
        );
    },
    handler: async (data) => {
        const creditCardID = await getCreditCardID(data);
        return await createTransaction(data, creditCardID);
    }
};