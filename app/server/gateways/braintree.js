const braintree = require('braintree');
const errorConstructor = require('../errorConstructor');
const promisify = require('../promisify');
const redisClient = require('../redisClient');
const hasher = require('../hasher');

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// define promisifed object here so they are reused
const customerCreate = promisify(gateway.customer, 'create');
const creditCardCreate = promisify(gateway.creditCard, 'create');
const transactionSale = promisify(gateway.transaction, 'sale');

const notSupportedCurrencies = [
    'USD',
    'EUR',
    'AUD'
];

const checkCachedData = async (customerID) => {
    const cachedData = await redisClient.getAsync(customerID);
    if (cachedData) {
        const parsed = JSON.parse(cachedData.toString());
        return parsed;
    }
    return {};
};

const createCustomerIfNotExists = async (customerID, cachedData) => {
    if (cachedData.created) {
        return cachedData;
    }
    await customerCreate({id: customerID});
    cachedData.created = true;
    redisClient.set(customerID, JSON.stringify(cachedData));
    return cachedData;
};

const createCreditCardTokenIfNotExists = async (data, customerID, hashedCard, cachedData) => {
    if (cachedData.cards && Object.keys(cachedData.cards).includes(hashedCard)) {
        return cachedData;
    }
    const response = await creditCardCreate({
        cardholderName: data.cardHolder,
        customerId: customerID,
        cvv: data.cardCvc,
        expirationMonth: data.cardExpiry.month,
        expirationYear: data.cardExpiry.year,
        number: data.cardNumber,
    });

    if (response.message) {
        throw response;
    }
    if (!cachedData.cards) {
        cachedData.cards = {};
    }
    cachedData.cards[hashedCard] = response.creditCard.token;
    redisClient.set(customerID, JSON.stringify(cachedData));
    return cachedData;
};

const createTransaction = async (data, customerID, hashedCard, cachedData) => {
    const paymentMethodToken = cachedData.cards[hashedCard];
    const response = await transactionSale({
        amount: data.orderPrice,
        merchantAccountId: data.orderCurrency,
        paymentMethodToken
    });
    return ({
        paymentID: response.transaction.id,
        gateway: 'braintree',
        cardToken: paymentMethodToken,
        response
    });
};

module.exports = {
    predicate: (data) => {
        return (
            data.cardType !== 'amex' && !notSupportedCurrencies.includes(data.orderCurrency)
        );
    },
    handler: async (data) => {
        const customerID = hasher(data.cardHolder);
        const hashedCard = hasher([
            data.cardNumber,
            data.cardExpiry.month,
            data.cardExpiry.year,
            data.cardCvc
        ]);
        try {
            let cachedData = await checkCachedData(customerID);
            cachedData = await createCustomerIfNotExists(customerID, cachedData);
            cachedData = await createCreditCardTokenIfNotExists(data, customerID, hashedCard, cachedData);
            return await createTransaction(data, customerID, hashedCard, cachedData);
        } catch (error) {
            // format the error
            const errorObj = errorConstructor(error.message, 400, {
                field: 'general',
                reason: error.message
            });
            throw errorObj;
        }
    }
};