var express = require('express');
const { createDetailOrderHotel } = require('../controllers/DetailOrderHotel');
var router = express.Router();

/* GET users listing. */
router.post('/create', createDetailOrderHotel)
// router.get('/data-dokter', getDataDokter)


module.exports = router;
