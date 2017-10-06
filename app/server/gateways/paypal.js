const supportCurrencies = [
    'USD',
    'EUR',
    'AUD'
];

module.exports = {
    predicate: (data) => {
        return (
            supportCurrencies.includes(data.orderCurrency) ||
            data.cardType === 'amex' && data.orderCurrency === 'USD'
        );
    },
    handler: (data) => {
        console.log('I am paypal handler');
    }
};