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

const getCachedData = async (customerID) => {
    const cachedData = await redisClient.getAsync(customerID);
    if (cachedData) {
        const parsed = JSON.parse(cachedData.toString());
        return parsed;
    }
    return {};
};

const createCustomer = async (customerID) => {
    const response = await customerCreate({id: customerID});

    // if the response contains message, it is error and need to throw out
    if (response.message) {
        throw response;
    }

    return customerID;
};

/**
 * Create credit card token from Braintree from the credit card data
 * 
 * Return the credit card token
 * 
 * @param {object} data The payment form data
 * @param {string} customerID The hashed customer ID
 * 
 * @return {object} The credit card token
 */
const createCreditCardToken = async (data, customerID) => {
    const response = await creditCardCreate({
        cardholderName: data.cardHolder,
        customerId: customerID,
        cvv: data.cardCvc,
        expirationMonth: data.cardExpiry.month,
        expirationYear: data.cardExpiry.year,
        number: data.cardNumber,
    });

    // if the response contains message, it is error and need to throw out
    if (response.message) {
        throw response;
    }

    return response.creditCard.token;
};

/**
 * Create transaction with credit card token
 * 
 * Return the response object
 * 
 * @param {object} data The payment form data
 * @param {string} paymentMethodToken The credit card payment method token
 * 
 * @return {Object} The response object
 */
const createTransaction = async (data, paymentMethodToken) => {
    const response = await transactionSale({
        amount: data.orderPrice,
        merchantAccountId: data.orderCurrency,
        paymentMethodToken
    });

    // if the response contains message, it is error and need to throw out
    if (response.message) {
        throw response;
    }

    return response;
};

module.exports = {
    predicate: (data) => {
        return (
            data.cardType !== 'amex' && !notSupportedCurrencies.includes(data.orderCurrency)
        );
    },
    /**
     * Pay with Braintree gateway with credit card data
     * 
     * 1. Need to check if we created a customer from the card object and customer name
     *    - If not, create one
     * 2. Need to check if we added payment method for the credit card for the customer
     *    - If not, add one
     * 3. From the payment method token, create a transaction to pay
     * 
     * @param {object} data The payment form data
     * 
     * @return {object} The "record" data structure
     */
    handler: async (data) => {
        const hashedCard = hasher([
            data.cardNumber,
            data.cardExpiry.month,
            data.cardExpiry.year,
            data.cardCvc
        ]);
        const customerID = hasher([data.cardHolder, hashedCard]);

        try {
            let cachedData = await getCachedData(customerID);
            if (!cachedData.created) {
                await createCustomer(customerID);
                cachedData.created = true;
                redisClient.set(customerID, JSON.stringify(cachedData));
            }
            let cardToken = cachedData.cardToken;
            if (!cardToken) {
                cardToken = await createCreditCardToken(data, customerID, cachedData);
                cachedData.cardToken = cardToken;
                redisClient.set(customerID, JSON.stringify(cachedData));
            }

            const response = await createTransaction(data, cardToken);

            return ({
                paymentID: response.transaction.id,
                gateway: 'braintree',
                cardToken,
                response
            });
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