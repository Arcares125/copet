var express = require('express');
const { getHewanPeliharaan, createHewanPeliharaan, getAllHewanPeliharaan, deleteHewan, } = require('../controllers/HewanPeliharaan');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.get('/:userId?', getAllHewanPeliharaan)
router.post('/create', createHewanPeliharaan)
router.delete('/delete/:userId?/:hewanId?', deleteHewan)


module.exports = router;
