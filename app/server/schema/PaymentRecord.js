const client = require('../redisClient');
const { hash, decrypt, encrypt } = require('../crypto');

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

    async load() {
        const key = this.getKey();
        const cachedData = await client.getAsync(`db:record:${key}`);
        if (cachedData) {
            this.data = JSON.parse(decrypt(cachedData));
        }
    }

    save() {
        const key = this.getKey();
        client.set(`db:record:${key}`, encrypt(JSON.stringify(this.data)));
    }
}

module.exports = PaymentRecord;