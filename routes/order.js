var express = require('express');
const { createOrder } = require('../controllers/Order');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/create', createOrder)


module.exports = router;
