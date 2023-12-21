var express = require('express');
const { confirmRegisterToko, confirmRegisterDokter, confirmRegisterTrainer } = require('../controllers/AdminController');
// const authentication = require('../middleware/authentication');
var router = express.Router();

/* GET users listing. */
router.post('/confirmRegisterToko/:tokoId', confirmRegisterToko)
router.post('/confirmRegisterDokter/:dokterId', confirmRegisterDokter)
router.post('/confirmRegisterTrainer/:trainerId', confirmRegisterTrainer)

module.exports = router;