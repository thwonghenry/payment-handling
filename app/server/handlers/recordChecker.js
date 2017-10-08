const redisClient = require('../redisClient');
const { hash, decrypt } = require('../crypto');

const errorConstructor = require('../errorConstructor');

const getRecordByCustomerNameAndPaymentID = async (orderCustomer, paymentID) => {
    try {
        const key = hash([orderCustomer, paymentID]);
        const cachedData = await redisClient.getAsync(`record:${key}`);
        if (cachedData) {
            return JSON.parse(decrypt(cachedData));
        }
        return false;
    } catch (error) {
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