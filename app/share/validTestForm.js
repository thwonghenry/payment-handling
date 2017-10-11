import { transform } from './paymentFormHandler';

export const validForm = {
    orderCustomer: 'Test Customer',
    orderPhone: '1234567919',
    orderPrice: '3.99',
    orderCurrency: 'USD',
    cardHolder: 'Test Holder',
    cardNumber: '4444333322221111',
    cardExpiry: '12/99',
    cardCvc: '333'
};

export const transformedValidForm = transform(validForm);

export const testCards = (() => {
    const cardNumbers = {
        'visa': '4444333322221111',
        'mastercard': '5454545454545454',
        'discover': '6011000400000000',
        'amex': '378282246310005',
        'jcb': '3528000700000000',
        'dinersclub': '6011000400000000',
        'maestro': '6759649826438453',
        'laser': '630490017740292441',
        'unionpay': '6212345678901232',
        'hipercard': '6062825624254001',
        'elo': '5066991111111118'
    };
    const cards = {};
    Object.keys(cardNumbers).forEach((key) => cards[key] = { cardNumber: cardNumbers[key], cardCvc: '333' });
    cards.amex = {
        cardNumber: '378282246310005',
        cardCvc: '4444'
    };
    return cards;
})();
