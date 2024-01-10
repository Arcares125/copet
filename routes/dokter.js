var express = require('express');
const { registerDokter, getDataDokter, updateDokter } = require('../controllers/Dokter');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerDokter)
router.get('/data-dokter', getDataDokter)
router.post('/update/:dokterId', updateDokter)

module.exports = router;
