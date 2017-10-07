const { promisify } = require('util');

module.exports = (object, methodName) => promisify(object[methodName]).bind(object);