const express = require('express');
const { createMeet,makeAttendence } = require('../Controllers/MeetControllers');
const { verifyToken } = require('../Helpers/JWT_Auth');
const router = express.Router();

router.route('/').post(createMeet)
router.post('/join/:id',makeAttendence)

module.exports = router;