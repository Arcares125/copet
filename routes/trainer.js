var express = require('express');
const { registerTrainer, getDataTrainer } = require('../controllers/Trainer');
var router = express.Router();

/* GET users listing. */
router.post('/register', registerTrainer)
router.get('/data-trainer', getDataTrainer)


module.exports = router;
