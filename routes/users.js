var express = require('express');
const { loginUser } = require('../controllers/AuthController');
// const { validationToken } = require('../middleware');
const authentication = require('../middleware/authentication');
const { getProfile, updateUser, deleteUser } = require('../controllers/UserController');
const router = express.Router();

/* GET users listing. */
router.get('/profile', authentication.authenticateToken, getProfile)
router.post('/update/:userId', updateUser)
router.delete('/delete/:userId', deleteUser)

module.exports = router;
