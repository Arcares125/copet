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
    getOrderStatusCompleteExpireCancelPenyediaJasa,
    getDetailOrderPenyedia,
    createOrderDokter,
    createOrderTrainer,
    getDetailOrderDokter,
    getDetailOrderDokterPenyedia,
    getOrderStatusWaitingPaymentDokter} = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
router.post('/create', createOrder)
router.post('/create-dokter', createOrderDokter)
router.post('/create-trainer', createOrderTrainer)
router.post('/get-payment', getPaymentData)
router.post('/check-payment', checkPaymentStatus)
//user
router.get('/:userId?/getOrderStatusWaitingPayment', getOrderStatusWaitingPayment)
router.get('/:userId?/getOrderStatusCompleteExpireCancel', getOrderStatusCompleteExpireCancel)
router.get('/:userId?/getOrderStatusOnProgress', getOrderStatusOnProgress)

router.get('/:userId?/order-dokter-waiting', getOrderStatusWaitingPaymentDokter)

//penyedia jasa
router.get('/:penyediaId?/getOrderStatusWaitingPaymentPenyedia', getOrderStatusWaitingPaymentPenyediaJasa)
router.get('/:penyediaId?/getOrderStatusCompleteExpireCancelPenyedia', getOrderStatusCompleteExpireCancelPenyediaJasa)
router.get('/:penyediaId?/getOrderStatusOnProgressPenyedia', getOrderStatusOnProgressPenyediaJasa)
router.get('/order-dokter-penyedia/:penyediaId?/:orderId?', getDetailOrderDokterPenyedia)
//end
router.post('/setOrderToCompleted/:orderId?', setOrderToCompleted)
router.post('/set-order-to-expired/:orderId?', setPaymentToExpired)
router.get('/:userId?/:orderId?', getDetailOrder)
// dokter
router.get('/order-dokter/:userId?/:orderId?', getDetailOrderDokter)
router.get('/order-penyedia/:penyediaId?/:orderId?', getDetailOrderPenyedia)

// router.get('/:userId?/:orderId?', getDetailOrder)
// router.get('/order-penyedia/:penyediaId?/:orderId?', getDetailOrderPenyedia)




module.exports = router;
