var express = require('express');
const { registerPenyediaJasa, updatePenyediaJasa, deletePenyediaJasa, confirmOrder } = require('../controllers/PenyediaJasa');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerPenyediaJasa)
router.put('/update/:penyediaId', updatePenyediaJasa)
router.delete('/delete/:penyediaId', deletePenyediaJasa)
router.delete('/confirm-order/:penyediaId/:orderId', confirmOrder)


module.exports = router;
