const pg = require('../db/knex');
const redisClient = require('../redisClient');
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
    'paymentID'
];

class PaymentRecord {
    constructor(orderCustomer, paymentID) {
        this.orderCustomer = orderCustomer;
        this.paymentID = paymentID;
        this.data = {
            orderCustomer, paymentID
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
        return hash([this.orderCustomer, this.paymentID]);
    }

    getCacheKey() {
        return `cache:record:${this.getKey()}`;
    }

    async load() {
        // get from cache first
        const cacheKey = this.getCacheKey();
        let cachedData = await redisClient.getAsync(cacheKey);
        if (cachedData) {
            cachedData = JSON.parse(cachedData);
            if (cachedData.orderPhone) {
                return cachedData;
            }
        }

        // if no result, get from DB
        const result = await pg(tableName).select().where({
            payment_id: this.paymentID,
            order_customer: this.orderCustomer
        });

        // The field names are in snake case, need to convert them to camel cases
        const data = result[0];
        Object.keys(data).forEach((field) => this.data[camelCase(field)] = data[field]);
        this.data.response = JSON.parse(this.data.response);

        // update the cache
        redisClient.set(cacheKey, JSON.stringify(this.data));
        return this.data;
    }

    async save() {
        await pg(tableName).insert({
            order_customer: this.data.orderCustomer,
            order_phone: this.data.orderPhone,
            order_price: this.data.orderPrice,
            order_currency: this.data.orderCurrency,
            gateway: this.data.gateway,
            payment_id: this.data.paymentID,
            response: this.data.response
        });

        // remove the outdated cache
        redisClient.del(this.getCacheKey());
    }
}

module.exports = PaymentRecord;