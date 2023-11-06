var express = require('express');
const { registerHotel } = require('../controllers/Hotel');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerHotel)


module.exports = router;
