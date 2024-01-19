var express = require('express');
const { registerTrainer, getDataTrainer, updateTrainer, confirmOrder } = require('../controllers/Trainer');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerTrainer)
router.post('/confirm-order/:orderId', confirmOrder)
router.get('/data-trainer', getDataTrainer)
router.put('/update/:trainerId', updateTrainer)


module.exports = router;
