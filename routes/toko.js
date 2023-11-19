var express = require('express');
const { registerToko, getDataToko, getDetailCardToko, getDetailCardTokoFull } = require('../controllers/Toko');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerToko)
router.post('/data-toko', getDataToko)
router.get('/toko-card', getDetailCardToko)
router.get('/toko-card-detail/:id', getDetailCardTokoFull)


module.exports = router;
