import PaymentRecord from './PaymentRecord';
import { validForm } from '../../share/validTestForm';
import mockDB from 'mock-knex';
import pg from '../db/knex';

mockDB.mock(pg);

const tracker = mockDB.getTracker();

test('Should update data when construct', () => {
    const record = new PaymentRecord('customer', 'abc');
    const data = record.getData();
    expect(data).toEqual({
        orderCustomer: 'customer',
        paymentId: 'abc'
    });
});

test('Should be able to set fields', () => {
    const record = new PaymentRecord('customer', 'abc');
    record.set('gateway', 'braintree');
    record.set('response', { 'test': 'data' });
    record.set('orderPhone', validForm.orderPhone);
    record.set('orderPrice', validForm.orderPrice);
    record.set('orderCurrency', validForm.orderCurrency);

    expect(record.getData()).toEqual({
        orderCustomer: 'customer',
        paymentId: 'abc',
        gateway: 'braintree',
        response: { 'test': 'data' },
        orderPhone: validForm.orderPhone,
        orderPrice: validForm.orderPrice,
        orderCurrency: validForm.orderCurrency
    });
});

test('Should throw invalid field', () => {
    const record = new PaymentRecord('customer', 'abc');
    expect(() => {
        record.set('abc', 'abc');
    }).toThrow();
});

test('Should attempt to insert to DB', async () => {
    tracker.install();
    tracker.on('query', (query) => {
        expect(query.method).toBe('insert');
        expect(query.sql).toBe('insert into "payment_record" ("gateway", "order_currency", "order_customer", "order_phone", "order_price", "payment_id", "response") values (?, ?, ?, ?, ?, ?, ?)');
        expect(query.bindings).toEqual([
            'braintree',
            validForm.orderCurrency,
            'customer',
            validForm.orderPhone,
            validForm.orderPrice,
            'abc',
            JSON.stringify({'test': 'data'})
        ]);
        query.response();
    });
    const record = new PaymentRecord('customer', 'abc');
    record.set('gateway', 'braintree');
    record.set('response', { 'test': 'data' });
    record.set('orderPhone', validForm.orderPhone);
    record.set('orderPrice', validForm.orderPrice);
    record.set('orderCurrency', validForm.orderCurrency);

    await record.save();
    tracker.uninstall();
});

test('Should handle empty selection from DB', async () => {
    tracker.install();
    tracker.on('query', (query) => {
        expect(query.method).toBe('select');
        expect(query.sql).toBe('select * from "payment_record" where "payment_id" = ? and "order_customer" = ?');
        expect(query.bindings).toEqual([
            'abc',
            'customer'
        ]);
        query.response();
    });
    const record = new PaymentRecord('customer', 'abc');

    const result = await record.load();
    expect(result).toEqual({
        paymentId: 'abc',
        orderCustomer: 'customer'
    });
    tracker.uninstall();
});

test('Should handle having data selection from DB', async () => {
    tracker.install();
    tracker.on('query', (query) => {
        expect(query.method).toBe('select');
        expect(query.sql).toBe('select * from "payment_record" where "payment_id" = ? and "order_customer" = ?');
        expect(query.bindings).toEqual([
            'abc',
            'customer'
        ]);
        query.response([{
            response: JSON.stringify({ 'test': 'data'}),
            order_phone: validForm.orderPhone,
            order_price: validForm.orderPrice,
            order_currency: validForm.orderCurrency,
            payment_id: 'abc',
            order_customer: 'customer',
            gateway: 'braintree'
        }]);
    });
    const record = new PaymentRecord('customer', 'abc');

    const result = await record.load();
    expect(result).toEqual({
        response: { 'test': 'data'},
        orderPhone: validForm.orderPhone,
        orderPrice: validForm.orderPrice,
        orderCurrency: validForm.orderCurrency,
        paymentId: 'abc',
        orderCustomer: 'customer',
        gateway: 'braintree'
    });
    tracker.uninstall();
});