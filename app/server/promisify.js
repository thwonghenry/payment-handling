const { promisify } = require('util');

module.exports = (object, methodName) => {
    const asyncFunc = promisify(object[methodName]).bind(object);
    // save the custom promisified method with 'this' binding
    // https://nodejs.org/api/util.html#util_custom_promisified_functions
    object[promisify.custom] = asyncFunc;
    return asyncFunc;
};