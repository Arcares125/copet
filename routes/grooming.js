var express = require('express');
const { registerGrooming, updateGrooming, deleteGrooming } = require('../controllers/Grooming');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/register', registerGrooming)
router.put('/update/:groomingId', updateGrooming)
router.delete('/delete/:tokoId?/:groomingId?', deleteGrooming)


module.exports = router;
