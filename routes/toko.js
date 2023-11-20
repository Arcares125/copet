var express = require('express');
const { registerToko, getDataToko, getDetailCardToko, getDetailCardTokoFull, getPackageListStore } = require('../controllers/Toko');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerToko)
router.post('/data-toko', getDataToko)
router.get('/toko-card/:search?', getDetailCardToko)
router.get('/toko-card-detail/:id', getDetailCardTokoFull)
router.get('/:toko_id/:service_type', getPackageListStore)



module.exports = router;
