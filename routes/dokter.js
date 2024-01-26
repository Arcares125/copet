var express = require('express');
const { registerDokter, getDataDokter, updateDokter, confirmOrder, getDataDokterDetail, updateAvailable, getDataDokterAvailable } = require('../controllers/Dokter');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerDokter)
router.post('/confirm-order/:orderId', confirmOrder)
router.get('/data-dokter/:dokterId?', getDataDokter)
router.get('/data-dokter-detail/:dokterId?', getDataDokterDetail)
router.get('/data-dokter-available', getDataDokterAvailable)
router.put('/update/:dokterId', updateDokter)
router.put('/update-status/:dokterId', updateAvailable)

module.exports = router;
