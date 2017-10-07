const redisClient = require('../redisClient');
const getHashFromData = redisClient.getHashFromData;

const errorConstructor = require('error');

const getRecordByCustomerNameAndPaymentID = (cardHolder, paymentID) => {
    return new Promise((resolve) => {
        const key = getHashFromData([cardHolder, paymentID]);
        redisClient.get(`record:${key}`, (err, response) => {
            if (err) {
                resolve({});
            }
            if (response) {
                const record = JSON.parse(response.toString());
                resolve(record);
            }
            resolve({});
        });
    });
};

module.exports = (req, res, next) => {
    const query = req.query;
    const params = req.params;
    if (!query.cardHolder || !params.id) {
        res.status(400).send(errorConstructor(
            'Missing Customer Name',
            400,
            {
                field: 'cardHolder',
                reason: 'is missing'
            }
        ));
        return;
    }
    getRecordByCustomerNameAndPaymentID(query.cardHolder, params.id)
        .then((data) => {
            if (data.paymentID) {
                res.send(data);
                next();
            } else {
                // TODO: get data using API
            }
        });
};