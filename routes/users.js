var express = require('express');
const { loginUser } = require('../controllers/AuthController');
// const { validationToken } = require('../middleware');
const authentication = require('../middleware/authentication');
const { getProfile } = require('../controllers/UserController');
const router = express.Router();

/* GET users listing. */
router.get('/profile', authentication.authenticateToken, getProfile)

module.exports = router;
