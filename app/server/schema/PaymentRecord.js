const pg = require('../db/knex');
const { hash } = require('../crypto');
const camelCase = require('camelcase');

const tableName = 'payment_record';

const validDataFields = [
    'gateway',
    'response',
    'orderPhone',
    'orderPrice',
    'orderCurrency',
    'orderCustomer',
    'paymentId'
];

class PaymentRecord {
    constructor(orderCustomer, paymentId) {
        this.orderCustomer = orderCustomer;
        this.paymentId = paymentId;
        this.data = {
            orderCustomer, paymentId
        };
    }

    set(field, value) {
        if (validDataFields.includes(field)) {
            if (field instanceof Object) {
                value = JSON.stringify(value);
            }
            this.data[field] = value;
        } else {
            throw new Error(`The schema does not contain field ${field}`);
        }
    }

    getData() {
        return this.data;
    }

    getKey() {
        return hash([this.orderCustomer, this.paymentId]);
    }

    getCacheKey() {
        return `cache:record:${this.getKey()}`;
    }

    async load() {
        // if no result, get from DB
        const result = await pg(tableName).select().where({
            payment_id: this.paymentId,
            order_customer: this.orderCustomer
        });

        // The field names are in snake case, need to convert them to camel cases
        if (result && result.length) {
            const data = result[0];
            Object.keys(data).forEach((field) => this.data[camelCase(field)] = data[field]);
            this.data.response = JSON.parse(this.data.response);
        }

        return this.data;
    }

    async save() {
        return await pg(tableName).insert({
            order_customer: this.data.orderCustomer,
            order_phone: this.data.orderPhone,
            order_price: this.data.orderPrice,
            order_currency: this.data.orderCurrency,
            gateway: this.data.gateway,
            payment_id: this.data.paymentId,
            response: JSON.stringify(this.data.response)
        });
    }
}

module.exports = PaymentRecord;