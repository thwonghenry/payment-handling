// custom error object constructor to include metadata for frontend
module.exports = (message, statusCode, meta) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.meta = meta;
    return error;
};
