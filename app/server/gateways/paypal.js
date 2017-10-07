const paypal = require('paypal-rest-sdk');
const redisClient = require('../redisClient');
const getHashFromData = redisClient.getHashFromData;
const errorConstructor = require('../error');

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

const createCreditCardID = (data, hash) => {
    return new Promise((resolve, reject) => {
        paypal.creditCard.create({
            number: data.cardNumber.replace(/ /g, ''),
            type: data.cardType,
            expire_month: data.cardExpiry.month,
            expire_year: data.cardExpiry.year
        }, (error, response) => {
            if (error) {
                reject(errorConstructor(error.response.message, error.httpStatusCode, {
                    field: 'general',
                    reason: error.response.message
                }));
                return;
            }
            redisClient.set(`vault:${hash}`, response.id);
            resolve(response.id);
        });
    });
};

const getCreditCardID = (data) => {
    const hash = getHashFromData(data.cardNumber);
    return new Promise((resolve, reject) => {
        redisClient.get(`vault:${hash}`, (error, response) => {
            if (error) {
                reject(error);
                return;
            }
            if (!response) {
                createCreditCardID(data, hash)
                    .then((id) => resolve(id))
                    .catch((error) => reject(error));
            } else {
                resolve(response.toString());
            }
        });
    });
};

const createTransaction = (data, hostUrl) => (creditCardID) => {
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
        }],
        redirect_urls: {
            return_url: `${hostUrl}/payment-authorized`,
            cancel_url: `${hostUrl}`
        }
    };
    return new Promise((resolve, reject) => {
        paypal.payment.create(paymentData, (error, response) => {
            if (error) {
                const errorObj = errorConstructor(error.response.message, error.httpStatusCode, {
                    field: 'general',
                    reason: error.response.message
                });
                reject(errorObj);
                return;
            }
            resolve({
                paymentID: response.id,
                gateway: 'paypal',
                cardToken: creditCardID,
                response
            });
        });
    });
};

module.exports = {
    predicate: (data) => {
        return (
            supportCurrencies.includes(data.orderCurrency) ||
            data.cardType === 'amex' && data.orderCurrency === 'USD'
        );
    },
    handler: (data, req) => {
        const hostUrl = `${req.protocol}://${req.get('Host')}`;
        return getCreditCardID(data).then(createTransaction(data, hostUrl));
    }
};