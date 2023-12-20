var express = require('express');
const { createOrder, 
    getPaymentData, 
    checkPaymentStatus, 
    setPaymentToExpired, 
    getDetailOrder, 
    getOrderStatusWaitingPayment, 
    getOrderStatusOnProgress, 
    setOrderToCompleted, 
    getOrderStatusCompleteExpireCancel} = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/create', createOrder)
router.post('/get-payment', getPaymentData)
router.post('/check-payment', checkPaymentStatus)
router.get('/:userId?/getOrderStatusWaitingPayment', getOrderStatusWaitingPayment)
router.get('/:userId?/getOrderStatusCompleteExpireCancel', getOrderStatusCompleteExpireCancel)
router.get('/:userId?/getOrderStatusOnProgress', getOrderStatusOnProgress)
router.post('/setOrderToCompleted/:orderId?', setOrderToCompleted)
router.post('/set-order-to-expired/:orderId?', setPaymentToExpired)
router.get('/:userId?/:orderId?', getDetailOrder)
// router.get('/:orderId?', getDetailOrder)




module.exports = router;
