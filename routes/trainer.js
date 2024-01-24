var express = require('express');
const { registerTrainer, getDataTrainer, updateTrainer, confirmOrder } = require('../controllers/Trainer');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerTrainer)
router.post('/confirm-order/:orderId', confirmOrder)
router.get('/data-trainer/:trainerId', getDataTrainer)
router.put('/update/:trainerId', updateTrainer)

// router.post('/register', registerDokter)
// router.post('/confirm-order/:orderId', confirmOrder)
// router.get('/data-dokter/:dokterId?', getDataDokter)
// router.put('/update/:dokterId', updateDokter)


module.exports = router;
