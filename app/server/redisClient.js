const redis = require('redis');
const promisify = require('./promisify');

const client = redis.createClient(process.env.REDIS_URL || '//redis:6379');

client.getAsync = promisify(client, 'get');

module.exports = client;