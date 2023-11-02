var express = require('express');
const { registerDokter, getDataDokter } = require('../controllers/Dokter');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerDokter)
router.get('/data-dokter', getDataDokter)


module.exports = router;
