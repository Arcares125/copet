var express = require('express');
const { getOnProgressChat, getAllChat } = require('../controllers/ChatController');
var router = express.Router();

/* GET users listing. */
router.get('/listOnProgress', getOnProgressChat)
router.get('/listAllChat', getAllChat)

module.exports = router;