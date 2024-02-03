var express = require('express');
const { getOnProgressChat, getAllChat, startChat, getDetailChat } = require('../controllers/ChatController');
var router = express.Router();

/* GET users listing. */
router.get('/listOnProgress/:userId?', getOnProgressChat)
router.get('/listAllChat', getAllChat)
router.get('/detailChat/:orderId?', getDetailChat)
router.post('/startChat', startChat)

module.exports = router;