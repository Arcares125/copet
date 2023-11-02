var express = require('express');
const { registerToko, getDataToko } = require('../controllers/Toko');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerToko)
router.get('/data-toko', getDataToko)


module.exports = router;
