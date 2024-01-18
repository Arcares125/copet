var express = require('express');
const { registerDokter, getDataDokter, updateDokter, confirmOrder } = require('../controllers/Dokter');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerDokter)
router.post('/confirm-order', confirmOrder)
router.get('/data-dokter', getDataDokter)
router.put('/update/:dokterId', updateDokter)

module.exports = router;
