var express = require('express');
const { registerHotel, updateHotel, deleteHotel } = require('../controllers/Hotel');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerHotel)
router.put('/update/:hotelId', updateHotel)
router.delete('/delete/:tokoId?/:hotelId?', deleteHotel)


module.exports = router;
