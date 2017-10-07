const paypal = require('paypal-rest-sdk');
const redisClient = require('../redisClient');
const getHashFromData = redisClient.getHashFromData;

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
        }, (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            redisClient.set(`vault:${hash}`, data.id);
            resolve(data.id);
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
                        const paymentID = response.id;
                        const appendedData = Object.assign({}, data, {
                            paymentID,
                            gateway: 'paypal',
                            cardToken: creditCardID
                        });
                        // use token to replace credit card data
                        delete appendedData.cardExpiry;
                        delete appendedData.cardHolder;
                        delete appendedData.cardNumber;
                        delete appendedData.cardType;

                        // use card holder numabe and payment ID as key, so we can get it later by these two fields
                        const key = getHashFromData([data.cardHolder, paymentID]);
                        redisClient.set(`record:${key}`, JSON.stringify(appendedData));

                        resolve({ paymentID });
                    }
                });
            });
        });
    }
};