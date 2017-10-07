const crypto = require('crypto');

// helper function to hash any value
module.exports = (data) => {
    console.log(data);
    const key = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return hash;
};
