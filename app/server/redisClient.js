const redis = require('redis');
const crypto = require('crypto');

const client = redis.createClient(process.env.REDIS_URL || '//redis:6379');

client.getHashFromData = (data) => {
    const key = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return hash;
};

module.exports = client;