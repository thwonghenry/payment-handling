const redisClient = require('../redisClient');
const getHashFromData = redisClient.getHashFromData;

const errorConstructor = require('../error');

const getRecordByCustomerNameAndPaymentID = (cardHolder, paymentID) => {
    return new Promise((resolve) => {
        const key = getHashFromData([cardHolder, paymentID]);
        redisClient.get(`record:${key}`, (err, response) => {
            if (err) {
                resolve({});
                return;
            }
            if (response) {
                const record = JSON.parse(response.toString());
                resolve(record);
                return;
            }
            resolve({});
        });
    });
};

module.exports = (req, res, next) => {
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
    getRecordByCustomerNameAndPaymentID(query.orderCustomer, params.id)
        .then((data) => {
            if (data.paymentID) {
                res.send(data);
                next();
            } else {
                // TODO: get data using API
                res.status(404).send(errorConstructor(
                    'Record Not Found',
                    404,
                    {
                        field: 'general',
                        reason: 'Record Not Found'
                    }
                ));
            }
        });
};