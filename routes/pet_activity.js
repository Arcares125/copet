var express = require('express');
const { createActivity, 

} = require('../controllers/PetActivityController');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/create', createActivity)
// router.post('/get-payment', getPaymentData)
// router.post('/check-payment', checkPaymentStatus)
// router.get('/getOrderStatusWaitingPayment', getOrderStatusWaitingPayment)
// router.get('/getOrderStatusCompleteExpireCancel', getOrderStatusCompleteExpireCancel)
// router.get('/getOrderStatusOnProgress', getOrderStatusOnProgress)
// router.post('setOrderToCompleted/:orderId?', setOrderToCompleted)
// router.post('/set-order-to-expired/:orderId?', setPaymentToExpired)
// router.get('/:orderId?', getDetailOrder)



module.exports = router;