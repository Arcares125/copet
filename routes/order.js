var express = require('express');
const { createOrder, getPaymentData, checkPaymentStatus, setPaymentToExpired } = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/create', createOrder)
router.post('/get-payment', getPaymentData)
router.post('/check-payment', checkPaymentStatus)
router.post('/set-order-to-expired/:orderId', setPaymentToExpired)



module.exports = router;
