var express = require('express');
const { createOrder, getPaymentData } = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/create', createOrder)
router.post('/get-payment', getPaymentData)


module.exports = router;
