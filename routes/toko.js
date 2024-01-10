var express = require('express');
const { registerToko, getDataToko, getDetailCardToko, getDetailCardTokoFull, getPackageListStore, getDetailTokoPenyedia, cekTokoData, updateToko } = require('../controllers/Toko');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerToko)
router.get('/cektokodata', cekTokoData)
router.post('/data-toko', getDataToko)
router.get('/toko-card/:search?', getDetailCardToko)
router.get('/toko-card-detail/:id', getDetailCardTokoFull)
router.get('/detail-toko/:penyediaId', getDetailTokoPenyedia)
router.get('/:toko_id/:service_type', getPackageListStore)
router.post('/update/:tokoId', updateToko)



module.exports = router;
