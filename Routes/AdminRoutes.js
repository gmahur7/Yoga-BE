const express=require('express')
const { isAuthenticated } = require('../Helpers/JWT_Auth');
const { authAdmin } = require('../Controllers/AdminControllers');
const router=express.Router()

router.route('/').post(authAdmin)
// .get(isAuthenticated,getUsers)

module.exports = router; 