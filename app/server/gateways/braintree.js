const braintree = require('braintree');
const errorConstructor = require('../errorConstructor');
const promisify = require('../promisify');

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

const paymentFormToRequestData = (data) => ({
    amount: data.orderPrice,
    merchantAccountId: data.orderCurrency,
    creditCard: {
        cardholderName: data.cardHolder,
        cvv: data.cardCvc,
        expirationMonth: data.cardExpiry.month,
        expirationYear: data.cardExpiry.year,
        number: data.cardNumber,
    },
    options: {
        // submit for settlement immediately after authorized
        submitForSettlement: true
    }
});

const responseToRecordData = (response) => ({
    paymentId: response.transaction.id,
    gateway: 'braintree',
    response
});

/**
 * Create transaction with credit card token
 * 
 * Return the response object
 * 
 * @param {object} data The payment form data
 * 
 * @return {Object} The response object
 */
const createTransaction = async (data) => {
    const response = await promisify(gateway.transaction, 'sale')(paymentFormToRequestData(data));

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
    paymentFormToRequestData,
    responseToRecordData,
    /**
     * Pay with Braintree gateway with credit card data
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
            // format the error
            console.error(JSON.stringify(error, null, '\t'));
            throw errorConstructor(error.message, 400, {
                field: 'general',
                reason: error.message,
                response: error
            });
        }
    },
    name: 'braintree'
};