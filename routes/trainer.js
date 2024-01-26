var express = require('express');
const { registerTrainer, getDataTrainer, updateTrainer, confirmOrder, getDataTrainerDetail, updateAvailable, getDataTrainerAvailable } = require('../controllers/Trainer');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerTrainer)
router.post('/confirm-order/:orderId', confirmOrder)
router.get('/data-trainer/:trainerId?', getDataTrainer)
router.get('/data-trainer-detail/:trainerId?', getDataTrainerDetail)
router.get('/data-trainer-available', getDataTrainerAvailable)
router.put('/update/:trainerId', updateTrainer)
router.put('/update-status/:trainerId', updateAvailable)


module.exports = router;
