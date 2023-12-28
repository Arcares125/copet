var express = require('express');
const { createOrder, 
    getPaymentData, 
    checkPaymentStatus, 
    setPaymentToExpired, 
    getDetailOrder, 
    setOrderToCompleted, 
    getOrderStatusWaitingPayment, 
    getOrderStatusOnProgress, 
    getOrderStatusCompleteExpireCancel,
    getOrderStatusWaitingPaymentPenyediaJasa, 
    getOrderStatusOnProgressPenyediaJasa, 
    getOrderStatusCompleteExpireCancelPenyediaJasa} = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
router.post('/create', createOrder)
router.post('/get-payment', getPaymentData)
router.post('/check-payment', checkPaymentStatus)
//user
router.get('/:userId?/getOrderStatusWaitingPayment', getOrderStatusWaitingPayment)
router.get('/:userId?/getOrderStatusCompleteExpireCancel', getOrderStatusCompleteExpireCancel)
router.get('/:userId?/getOrderStatusOnProgress', getOrderStatusOnProgress)
//penyedia jasa
router.get('/:penyediaId?/getOrderStatusWaitingPaymentPenyedia', getOrderStatusWaitingPaymentPenyediaJasa)
router.get('/:penyediaId?/getOrderStatusCompleteExpireCancelPenyedia', getOrderStatusCompleteExpireCancelPenyediaJasa)
router.get('/:penyediaId?/getOrderStatusOnProgressPenyedia', getOrderStatusOnProgressPenyediaJasa)
//end
router.post('/setOrderToCompleted/:orderId?', setOrderToCompleted)
router.post('/set-order-to-expired/:orderId?', setPaymentToExpired)
router.get('/:userId?/:orderId?', getDetailOrder)




module.exports = router;
