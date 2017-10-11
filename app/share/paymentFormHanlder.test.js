import { transform, validateForm, requiredFields, errorMaker } from './paymentFormHandler';
import { validForm, testCards } from './validTestForm';

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