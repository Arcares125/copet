var express = require('express');
const { registerHotel, updateHotel } = require('../controllers/Hotel');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerHotel)
router.post('/update/:hotelId', updateHotel)

module.exports = router;
