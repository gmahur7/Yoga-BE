const express = require('express');
const { isAuthenticated } = require('../Helpers/JWT_Auth');
const {
    fetchMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    fetchMeetingsPerUser,
    joinMeeting,
} = require('../Controllers/MeetControllers')
const router = express.Router();

router.route('/').get(isAuthenticated, fetchMeetings).post(isAuthenticated, addMeeting);
router.route('/meet/:id').put(updateMeeting).delete(deleteMeeting);
router.route('/user').get(isAuthenticated,fetchMeetingsPerUser)
router.get('/join/:id',isAuthenticated,joinMeeting)


module.exports = router;