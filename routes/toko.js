var express = require('express');
const { registerToko, getDataToko, getDetailCardToko } = require('../controllers/Toko');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerToko)
router.get('/data-toko', getDataToko)
router.get('/detail-toko', getDetailCardToko)



module.exports = router;
