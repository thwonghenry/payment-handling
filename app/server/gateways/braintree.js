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

const checkCachedData = (customerID) => new Promise((resolve, reject) => {
    redisClient.get(customerID, (err, response) => {
        if (err) {
            reject(err);
        }
        if (response) {
            const parsed = JSON.parse(response.toString());
            resolve(parsed);
        }
        resolve({});
    });
});

const createCustomerIfNotExists = (customerID) => (cachedData) => new Promise((resolve, reject) => {
    if (cachedData.created) {
        resolve(cachedData);
        return;
    }
    gateway.customer.create({
        id: customerID
    }, (err) => {
        if (err) {
            reject(err);
            return;
        }
        cachedData.created = true;
        redisClient.set(customerID, JSON.stringify(cachedData));
        resolve(cachedData);
    });
});

const createCreditCardTokenIfNotExists = (data, customerID, hashedCard) => (cachedData) => new Promise((resolve, reject) => {
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
            reject(err);
            return;
        }

        if (!cachedData.cards) {
            cachedData.cards = {};
        }
        cachedData.cards[hashedCard] = response.creditCard.token;
        redisClient.set(customerID, JSON.stringify(cachedData));
        resolve(cachedData);
    });
});

const createTransaction = (data, customerID, hashedCard) => (cachedData) => new Promise((resolve, reject) => {
    const paymentMethodToken = cachedData.cards[hashedCard];
    gateway.transaction.sale({
        amount: data.orderPrice,
        merchantAccountId: data.orderCurrency,
        paymentMethodToken
    }, (err, response) => {
        if (err) {
            reject(err);
            return;
        }
        resolve({
            paymentID: response.transaction.id,
            gateway: 'braintree',
            cardToken: paymentMethodToken,
            response
        });
    });
});

module.exports = {
    predicate: (data) => {
        return (
            data.cardType !== 'amex' && !notSupportedCurrencies.includes(data.orderCurrency)
        );
    },
    handler: (data) => {
        const customerID = getHashFromData(data.cardHolder);
        const hashedCard = getHashFromData([
            data.cardNumber,
            data.cardExpiry.month,
            data.cardExpiry.year,
            data.Cvc
        ]);
        return checkCachedData(customerID)
            .then(createCustomerIfNotExists(customerID))
            .then(createCreditCardTokenIfNotExists(data, customerID, hashedCard))
            .then(createTransaction(data, customerID, hashedCard));
    }
};