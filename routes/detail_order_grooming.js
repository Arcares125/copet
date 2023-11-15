var express = require('express');
const { createDetailOrderGrooming } = require('../controllers/DetailOrderGrooming');
var router = express.Router();

/* GET users listing. */
router.post('/create', createDetailOrderGrooming)
// router.get('/data-dokter', getDataDokter)


module.exports = router;
