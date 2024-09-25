const express=require('express')
const router=express.Router()
const { registerVideo, fetchVideos, updateVideo, deleteVideo } = require('../Controllers/VideoControllers');

router.route('/').post(registerVideo).get(fetchVideos) 
router.put('/update/:id', updateVideo);      
router.delete('/delete/:id', deleteVideo);   


module.exports = router; 