const crypto = require('crypto');

module.exports = {
    hash: (data) => {
        const key = JSON.stringify(data);
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return hash;
    }
};
