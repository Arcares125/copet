var express = require('express');
const { loginUser, registerUser, getToken } = require('../controllers/AuthController');
const authentication = require('../middleware/authentication');
var router = express.Router();

/* GET users listing. */
router.post('/', getToken)


module.exports = router;