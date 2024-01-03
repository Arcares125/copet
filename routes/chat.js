var express = require('express');
const { getOnProgressChat } = require('../controllers/ChatController');
var router = express.Router();

/* GET users listing. */
router.get('/listOnProgress', getOnProgressChat)

module.exports = router;