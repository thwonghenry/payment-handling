const client = require('../redisClient');
const { hash, decrypt, encrypt } = require('../crypto');

class PaymentRecord {
    constructor(orderCustomer, paymentID) {
        this.orderCustomer = orderCustomer;
        this.paymentID = paymentID;
        this.data = {
            orderCustomer, paymentID
        };
    }

    set(field, value) {
        this.data[field] = value;
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