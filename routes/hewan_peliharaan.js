var express = require('express');
const { getHewanPeliharaan, createHewanPeliharaan, } = require('../controllers/HewanPeliharaan');
var router = express.Router();

/* GET users listing. */
router.get('/:id?', getHewanPeliharaan)
router.post('/', createHewanPeliharaan)


module.exports = router;
