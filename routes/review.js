var express = require('express');
const { createReview } = require('../controllers/review');
var router = express.Router();

/* GET users listing. */
router.post('/create', createReview)
// router.get('/data-dokter', getDataDokter)


module.exports = router;
