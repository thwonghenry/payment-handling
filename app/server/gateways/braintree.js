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
        console.log('I am braintree handler');
    }
};