var express = require('express');
const { getHewanPeliharaan, createHewanPeliharaan, getAllHewanPeliharaan, } = require('../controllers/HewanPeliharaan');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.get('/:userId?', getAllHewanPeliharaan)
router.post('/create', createHewanPeliharaan)


module.exports = router;
