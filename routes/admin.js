var express = require('express');
const { confirmRegisterToko, 
    confirmRegisterDokter, 
    confirmRegisterTrainer,
    getAllDataToko, getAllDataDokter, getAllDataTrainer, getAllDataPenyediaJasa, getAllDataUser, getAllDataPenyediaJasaIsNotAcc, getAllDataPenyediaJasaIsAcc } = require('../controllers/AdminController');
// const authentication = require('../middleware/authentication');
var router = express.Router();

/* GET users listing. */
router.post('/confirmRegisterToko/:tokoId', confirmRegisterToko)
router.post('/confirmRegisterDokter/:dokterId', confirmRegisterDokter)
router.post('/confirmRegisterTrainer/:trainerId', confirmRegisterTrainer)
router.get('/getDataToko', getAllDataToko)
router.get('/getDataDokter', getAllDataDokter)
router.get('/getDataTrainer', getAllDataTrainer)
router.get('/getDataPenyediaJasa', getAllDataPenyediaJasa)
router.get('/getDataPenyediaJasaNotAcc', getAllDataPenyediaJasaIsNotAcc)
router.get('/getDataPenyediaJasaIsAcc', getAllDataPenyediaJasaIsAcc)
router.get('/getDataUser', getAllDataUser)

module.exports = router;