import { transform, validateForm, requiredFields, errorMaker } from './paymentFormHandler';

const validForm = {
    orderCustomer: 'Test Customer',
    orderPhone: '1234567919',
    orderPrice: '3.99',
    orderCurrency: 'USD',
    cardHolder: 'Test Holder',
    cardNumber: '4444333322221111',
    cardExpiry: '12/99',
    cardCvc: '333'
};

const testCards = (() => {
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

test('should pass the validation', () => {
    expect(validateForm(validForm)).toBe(true);
});

test('validate form should fail any empty field', () => {
    requiredFields.forEach((field) => {
        const paymentForm = transform({
            ...validForm,
            [field]: ''
        });
        expect(validateForm(paymentForm)).toEqual(
            errorMaker(field, 'cannot be empty')
        );
    });
});

test('test card numbers', () => {
    const invalidCards = [
        '123',
        '4242 4242 4242 4241',
        'abcd abcd abcd abcd',
    ];
    invalidCards.forEach((invalidNumber) => {
        const paymentForm = transform({
            ...validForm,
            cardNumber: invalidNumber
        });
        expect(validateForm(paymentForm)).toEqual(
            errorMaker('cardNumber', 'is invalid')
        );
    });

    Object.keys(testCards).forEach((cardType) => {
        const paymentForm = transform({
            ...validForm,
            ...testCards[cardType]
        });
        expect(validateForm(paymentForm)).toBe(true);
    });
});

test('test card expiry', () => {
    const invalidExpiries = [
        'a',
        'aa/aa',
        '13/13',
        '12/201',
        '12/01',
        '12/1000',
        '3/11'
    ];

    invalidExpiries.forEach((invalidExpiry) => {
        const paymentForm = transform({
            ...validForm,
            cardExpiry: invalidExpiry
        });
        expect(validateForm(paymentForm)).toEqual(
            errorMaker('cardExpiry', 'is invalid')
        );
    });

    const validExpiries = [
        '12/99',
        '12/2099',
        '3/33'
    ];

    validExpiries.forEach((validExpiry) => {
        const paymentForm = transform({
            ...validForm,
            cardExpiry: validExpiry
        });
        expect(validateForm(paymentForm)).toEqual(true);
    });
});

test('test amex and USD', () => {
    const validPayment = transform({
        ...validForm,
        ...testCards.amex
    });
    expect(validateForm(validPayment)).toEqual(true);

    const nonValidPayment = transform({
        ...validForm,
        ...testCards.amex,
        orderCurrency: 'HKD'
    });

    expect(validateForm(nonValidPayment)).toEqual(
        errorMaker('general', 'AMEX credit card can only use USD for currency')
    );
});