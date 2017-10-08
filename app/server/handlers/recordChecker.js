const redisClient = require('../redisClient');
const PaymentRecord = require('../schema/PaymentRecord');
const { encrypt, decrypt } = require('../crypto');

const errorConstructor = require('../errorConstructor');

/**
 * Get the record by customer name and payment id
 * 
 * First try to get from cache, then try to get from database
 * 
 * If the data is missing "orderPhone" field, that means the record is not exists and return false
 */
const getRecordByCustomerNameAndPaymentID = async (orderCustomer, paymentID) => {
    try {
        const record = new PaymentRecord(orderCustomer, paymentID);
        const key = record.getKey();
        let cachedData = await redisClient.getAsync(`cache:record:${key}`);
        if (cachedData) {
            cachedData = JSON.parse(decrypt(cachedData));
            if (cachedData.orderPhone) {
                return cachedData;
            }
            return false;
        } else {
            await record.load();
            const data = record.getData();
            redisClient.set(`cache:record:${key}`, encrypt(JSON.stringify(data)));
            if (data.orderPhone) {
                return data;
            }
            return false;
        }
    } catch (error) {
        console.log(JSON.stringify(error));
        return false;
    }
};

module.exports = async (req, res) => {
    const query = req.query;
    const params = req.params;
    if (!query.orderCustomer || !params.id) {
        res.status(400).send(errorConstructor(
            'Missing Customer Name',
            400,
            {
                field: 'orderCustomer',
                reason: 'is missing'
            }
        ));
        return;
    }
    const record = await getRecordByCustomerNameAndPaymentID(query.orderCustomer, params.id);
    if (record) {
        res.send(record);
    } else {
        res.status(404).send(errorConstructor(
            'Record Not Found',
            404,
            {
                field: 'general',
                reason: 'Record Not Found'
            }
        ));
    }
};