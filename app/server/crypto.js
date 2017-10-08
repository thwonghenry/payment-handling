const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secret = process.env.SECRET;

if (!secret) {
    throw new Error('Secret is not defined!');
}

module.exports = {
    hash: (data) => {
        const key = JSON.stringify(data);
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return hash;
    },

    encrypt: (data) => {
        const cipher = crypto.createCipher(algorithm, secret);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },

    decrypt: (data) => {
        const decipher = crypto.createDecipher(algorithm, secret);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
