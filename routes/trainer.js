var express = require('express');
const { registerTrainer, getDataTrainer, updateTrainer } = require('../controllers/Trainer');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerTrainer)
router.get('/data-trainer', getDataTrainer)
router.post('/update/:trainerId', updateTrainer)


module.exports = router;
