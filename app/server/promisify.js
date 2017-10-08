const { promisify } = require('util');

module.exports = (object, methodName) => {
    const func = object[methodName];
    const asyncFunc = promisify(func).bind(object);
    // save the custom promisified method with 'this' binding
    // https://nodejs.org/api/util.html#util_custom_promisified_functions
    func[promisify.custom] = asyncFunc;
    return asyncFunc;
};