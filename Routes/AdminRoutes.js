const express=require('express')
const { isAuthenticated } = require('../Helpers/JWT_Auth');
const { authAdmin, verifyAdmin } = require('../Controllers/AdminControllers');
const router=express.Router()

router.route('/').post(authAdmin)
router.get('/verify',verifyAdmin)
// .get(isAuthenticated,getUsers)

module.exports = router; 