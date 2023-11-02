var express = require('express');
const { loginUser, loginPenyediaJasa, registerUser, logout } = require('../controllers/AuthController');
const authentication = require('../middleware/authentication');
var router = express.Router();

/* GET users listing. */
router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/logout', logout)


// Penyedia Jasa
router.post('/login-penyedia-jasa', loginPenyediaJasa)

module.exports = router;