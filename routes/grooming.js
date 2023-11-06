var express = require('express');
const { registerGrooming } = require('../controllers/Grooming');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerGrooming)


module.exports = router;
