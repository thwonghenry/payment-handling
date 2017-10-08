const crypto = require('crypto');

// helper function to hash any value
module.exports = (data) => {
    const key = JSON.stringify(data);
    console.log(key);
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return hash;
};
