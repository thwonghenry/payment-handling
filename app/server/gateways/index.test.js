import gatewayChooser from './index';
import { validForm } from '../../share/validTestForm';

jest.mock('braintree');
jest.mock('paypal-rest-sdk');

test('should use paypal for USD', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 4242424242424242,
        orderCurrency: 'USD'
    }).name).toBe('paypal');
});

test('should use paypal for AMEX', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 378282246310005,
        cardCvc: 3333
    }).name).toBe('paypal');
});

test('should use paypal for EUR', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 4242424242424242,
        orderCurrency: 'EUR'
    }).name).toBe('paypal');
});

test('should use paypal for AUD', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 4242424242424242,
        orderCurrency: 'AUD'
    }).name).toBe('paypal');
});

test('should use braintree for HKD', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 4242424242424242,
        orderCurrency: 'HKD'
    }).name).toBe('braintree');
});


test('should use braintree for JPY', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 4242424242424242,
        orderCurrency: 'JPY'
    }).name).toBe('braintree');
});


test('should use braintree for CNY', () => {
    expect(gatewayChooser({
        ...validForm,
        cardNumber: 4242424242424242,
        orderCurrency: 'CNY'
    }).name).toBe('braintree');
});
