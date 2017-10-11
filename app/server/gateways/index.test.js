import gatewayChooser from './index';
import { validForm } from '../../share/validTestForm';

jest.mock('braintree');
jest.mock('paypal-rest-sdk');

test('should use paypal for USD', () => {
    expect(gatewayChooser(validForm).name).toBe('paypal');
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
        orderCurrency: 'EUR'
    }).name).toBe('paypal');
});

test('should use paypal for AUD', () => {
    expect(gatewayChooser({
        ...validForm,
        orderCurrency: 'AUD'
    }).name).toBe('paypal');
});

test('should use braintree for HKD', () => {
    expect(gatewayChooser({
        ...validForm,
        orderCurrency: 'HKD'
    }).name).toBe('braintree');
});


test('should use braintree for JPY', () => {
    expect(gatewayChooser({
        ...validForm,
        orderCurrency: 'JPY'
    }).name).toBe('braintree');
});


test('should use braintree for CNY', () => {
    expect(gatewayChooser({
        ...validForm,
        orderCurrency: 'CNY'
    }).name).toBe('braintree');
});
