var express = require('express');
const { createOrder, getPaymentData, checkPaymentStatus, setPaymentToExpired, getDetailOrder, getOrderStatusWaitingPayment, getOrderStatusOnProgress } = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/create', createOrder)
router.post('/get-payment', getPaymentData)
router.post('/check-payment', checkPaymentStatus)
router.get('/getOrderStatusWaitingPayment', getOrderStatusWaitingPayment)
router.get('/getOrderStatusOnProgress', getOrderStatusOnProgress)
router.post('/set-order-to-expired/:orderId?', setPaymentToExpired)
router.get('/:orderId?', getDetailOrder)



module.exports = router;
