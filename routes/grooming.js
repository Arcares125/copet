var express = require('express');
const { registerGrooming, updateGrooming } = require('../controllers/Grooming');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerGrooming)
router.post('/update/:groomingId', updateGrooming)


module.exports = router;
