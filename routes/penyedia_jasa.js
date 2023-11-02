var express = require('express');
const { registerPenyediaJasa } = require('../controllers/PenyediaJasa');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerPenyediaJasa)


module.exports = router;
