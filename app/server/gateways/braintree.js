const braintree = require('braintree');
const redisClient = require('../redisClient');
const getHashFromData = redisClient.getHashFromData;

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const notSupportedCurrencies = [
    'USD',
    'EUR',
    'AUD'
];

module.exports = {
    predicate: (data) => {
        return (
            data.cardType !== 'amex' && !notSupportedCurrencies.includes(data.orderCurrency)
        );
    },
    handler: (data) => {
        // if (!data.braintreeNonce) {
        //     return new Promise((resolve) => resolve({needNonce: true}));
        // }
        const customerID = getHashFromData(data.cardHolder);
        const hashedCard = getHashFromData([
            data.cardNumber,
            data.cardExpiry.month,
            data.cardExpiry.year,
            data.Cvc
        ]);
        return new Promise((resolve, reject) => {
            redisClient.get(customerID, (err, response) => {
                if (err) {
                    reject(err);
                }
                console.log(response);
                if (response) {
                    const parsed = JSON.parse(response.toString());
                    resolve(parsed);
                }
                resolve({});
            });
        })
            .then((cachedData) => new Promise((resolve, reject) => {
                if (cachedData.created) {
                    resolve(cachedData);
                    return;
                }
                gateway.customer.create({
                    id: customerID
                }, (err, response) => {
                    if (err) {
                        console.log('error', JSON.stringify(err));
                        reject(err);
                    }
                    cachedData.created = true;
                    redisClient.set(customerID, JSON.stringify(cachedData));
                    console.log('data', JSON.stringify(response));
                    resolve(cachedData);
                });
            }))
            .then((cachedData) => new Promise((resolve, reject) => {
                if (cachedData.cards && Object.keys(cachedData.cards).includes(hashedCard)) {
                    resolve(cachedData);
                    return;
                }
                gateway.creditCard.create({
                    cardholderName: data.cardHolder,
                    customerId: customerID,
                    cvv: data.cardCvc,
                    expirationMonth: data.cardExpiry.month,
                    expirationYear: data.cardExpiry.year,
                    number: data.cardNumber,

                }, (err, response) => {
                    if (err) {
                        console.log('error', JSON.stringify(err));
                        reject(err);
                    }
                    console.log('data', JSON.stringify(response));

                    if (!cachedData.cards) {
                        cachedData.cards = {};
                    }
                    cachedData.cards[hashedCard] = response.creditCard.token;
                    redisClient.set(customerID, JSON.stringify(cachedData));
                    resolve(cachedData);
                });
            }))
            .then((cachedData) => new Promise((resolve, reject) => {
                const paymentMethodToken = cachedData.cards[hashedCard];
                console.log(paymentMethodToken);
                gateway.transaction.sale({
                    amount: data.orderPrice,
                    merchantAccountId: data.orderCurrency,
                    paymentMethodToken
                }, (err, response) => {
                    if (err) {
                        console.log('error', JSON.stringify(err));
                        reject(err);
                    }
                    console.log('data', JSON.stringify(response));
                    // save the record
                    const paymentID = response.transaction.id;
                    const appendedData = Object.assign({}, data, {
                        paymentID,
                        gateway: 'braintree',
                        cardToken: paymentMethodToken
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
                });
            }));
    }
};