const express = require('express');
const path = require('path');
const paymentValidation = require('./handlers/paymentValidation');
const gatewayChooser = require('./handlers/gatewayChooser');
const recordChecker = require('./handlers/recordChecker');
const promisify = require('./promisify');

const router = new express.Router();

const sendIndexHtml = async (req, res) => {
    const fileName = path.resolve('public', 'index.html');
    if (process.env.NODE_ENV === 'development') {
        const devMiddleware = require('./devMiddleware');
        const htmlBuffer = await promisify(devMiddleware.fileSystem, 'readFile')(fileName);
        res.send(htmlBuffer.toString());
        return;
    }
    res.sendFile(path.resolve(__dirname, '..', fileName));
};

router.get('/payment-check', sendIndexHtml);
router.post('/payments', paymentValidation, gatewayChooser);
router.get('/payments/:id', recordChecker);

// fallback on missing route: go back to home page
router.get('/*', (req, res) => res.redirect('/'));

module.exports = router;