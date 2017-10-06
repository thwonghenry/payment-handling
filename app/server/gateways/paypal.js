const paypal = require('paypal-rest-sdk');
const crypto = require('crypto');
const redisClient = require('../redisClient');
const config = require('../../config').paypal;

paypal.configure(config);

const supportCurrencies = [
    'USD',
    'EUR',
    'AUD'
];

const getKeyByFormData = (data) => {
    // use array to ensure the order
    const key = JSON.stringify([data.cardNumber, data.cardHolder]);
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return hash;
};

const createCreditCardID = (data, key) => {
    return new Promise((resolve, reject) => {
        paypal.creditCard.create({
            number: data.cardNumber.replace(/ /g, ''),
            type: data.cardType,
            expire_month: data.cardExpiry.month,
            expire_year: data.cardExpiry.year
        }, (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            redisClient.set(`vault:${key}`, data.id);
            resolve(data.id);
        });
    });
};

const getCreditCardID = (data) => {
    const key = getKeyByFormData(data);
    return new Promise((resolve, reject) => {
        redisClient.get(`vault:${key}`, (error, response) => {
            if (error) {
                reject(error);
                return;
            }
            if (!response) {
                createCreditCardID(data, key).then((id) => resolve(id));
                return;
            }
            return resolve(response.toString());
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
        return getCreditCardID(data).then((creditCardID) => {
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
                        console.log(JSON.stringify(error));
                        reject(error);
                    } else {
                        // save the record
                        const key = getKeyByFormData(data);
                        const appendedData = Object.assign({}, data, {
                            paymentID: response.id,
                            cardToken: creditCardID
                        });
                        // use token to replace credit card data
                        delete appendedData.cardExpiry;
                        delete appendedData.cardHolder;
                        delete appendedData.cardNumber;
                        delete appendedData.cardType;
                        redisClient.set(`record:${key}`, JSON.stringify(appendedData));

                        resolve({ paymentID: response.id });
                    }
                });
            });
        });
    }
};