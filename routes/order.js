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
    getOrderStatusWaitingPaymentDokter,
    getOrderStatusOnProgressDokter,
    getOrderStatusCompleteExpireCancelDokter,
    getOrderStatusWaitingPaymentTrainer,
    getOrderStatusOnProgressTrainer,
    getOrderStatusCompleteExpireCancelTrainer,
    getDetailOrderTrainer,
    getDetailOrderTrainerPenyedia,
    allOrder,
    allOrderOnProgress,
    allOrderCompleteExpireCancel,
    getOrderStatusWaitingPaymentPenyediaDokterTrainer,
    getOrderStatusOnProgressPenyediaDokterTrainer,
    getOrderStatusCompleteExpireCancelPenyediaDokterTrainer,
    } = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
router.post('/create', createOrder)
router.post('/create-dokter', createOrderDokter)
router.post('/create-trainer', createOrderTrainer)
router.post('/get-payment', getPaymentData)
router.post('/check-payment', checkPaymentStatus)
router.get('/order-all/:userId?', allOrder)
router.get('/order-all-on-progress/:userId?', allOrderOnProgress)
router.get('/order-all-complete-expire-cancel/:userId?', allOrderCompleteExpireCancel)

//user
router.get('/:userId?/getOrderStatusWaitingPayment', getOrderStatusWaitingPayment)
router.get('/:userId?/getOrderStatusCompleteExpireCancel', getOrderStatusCompleteExpireCancel)
router.get('/:userId?/getOrderStatusOnProgress', getOrderStatusOnProgress)

router.get('/:userId?/order-dokter-waiting', getOrderStatusWaitingPaymentDokter)
router.get('/:userId?/order-dokter-onprogress', getOrderStatusOnProgressDokter)
router.get('/:userId?/order-dokter-complete-expire-cancel', getOrderStatusCompleteExpireCancelDokter)

router.get('/:userId?/order-trainer-waiting', getOrderStatusWaitingPaymentTrainer)
router.get('/:userId?/order-trainer-onprogress', getOrderStatusOnProgressTrainer)
router.get('/:userId?/order-trainer-complete-expire-cancel', getOrderStatusCompleteExpireCancelTrainer)

//penyedia jasa
router.get('/:penyediaId?/getOrderStatusWaitingPaymentPenyedia', getOrderStatusWaitingPaymentPenyediaJasa)
router.get('/:penyediaId?/getOrderStatusCompleteExpireCancelPenyedia', getOrderStatusCompleteExpireCancelPenyediaJasa)
router.get('/:penyediaId?/getOrderStatusOnProgressPenyedia', getOrderStatusOnProgressPenyediaJasa)
router.get('/order-penyedia/:penyediaId?/:orderId?', getDetailOrderPenyedia)

router.get('/:penyediaId?/getOrderStatusWaitingPaymentPenyediaDokterTrainer', getOrderStatusWaitingPaymentPenyediaDokterTrainer)
router.get('/:penyediaId?/getOrderStatusOnProgressPenyediaDokterTrainer', getOrderStatusOnProgressPenyediaDokterTrainer)
router.get('/:penyediaId?/getOrderStatusCompleteExpireCancelPenyediaDokterTrainer', getOrderStatusCompleteExpireCancelPenyediaDokterTrainer)
//end
router.post('/setOrderToCompleted/:orderId?', setOrderToCompleted)
router.post('/set-order-to-expired/:orderId?', setPaymentToExpired)
router.get('/:userId?/:orderId?', getDetailOrder)
// dokter
router.get('/order-dokter/:userId?/:orderId?', getDetailOrderDokter)
router.get('/order-dokter-penyedia/:penyediaId?/:orderId?', getDetailOrderDokterPenyedia)

// Trainer
router.get('/order-trainer/:userId?/:orderId?', getDetailOrderTrainer)
router.get('/order-trainer-penyedia/:penyediaId?/:orderId?', getDetailOrderTrainerPenyedia)




module.exports = router;
