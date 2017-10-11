const PaymentRecord = require('../schema/PaymentRecord');
const redisClient = require('../redisClient');
const errorConstructor = require('../errorConstructor');

/**
 * Get the record by customer name and payment id
 * 
 * First try to get from cache, then try to get from database
 * 
 * If the data is missing "orderPhone" field, that means the record is not exists and return false
 */
const getRecordByCustomerNameAndPaymentID = async (orderCustomer, paymentId) => {
    try {
        const record = new PaymentRecord(orderCustomer, paymentId);
        // get from cache first
        const cacheKey = record.getCacheKey();
        let cachedData = await redisClient.getAsync(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const recordData = await record.load();

        // update the cache
        redisClient.set(cacheKey, JSON.stringify(recordData));

        return recordData;
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
    // if the record has orderPhone, that means it has payment record
    if (record.orderPhone) {
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