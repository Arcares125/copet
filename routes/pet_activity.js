var express = require('express');
const { createActivity, updateActivity, getListActivity, deleteActivity

} = require('../controllers/PetActivityController');
var router = express.Router();

/* GET users listing. */
// router.get('/:id?', getHewanPeliharaan)
router.post('/createActivity/:userId?', createActivity)
router.put('/updateActivity/:activityId?', updateActivity)
router.get('/getListActivity/:userId?', getListActivity),
router.delete('/deleteActivity/:activityId?', deleteActivity)

module.exports = router;
