const express=require('express')
const { registerUser, authUser,forgetPassword,resetPassword,getUsers, verifyEmail, getUserData,getLiveUsersCount, logout, verifyUser, getReferrals, updateUserProfile, addPayment } = require('../Controllers/UserControllers')
const { isAuthenticated } = require('../Helpers/JWT_Auth')
const router=express.Router()

router.route('/').post(registerUser).get(isAuthenticated,getUsers)
router.post('/login',authUser)
router.post('/logout',logout)

router.get('/live-users-count',getLiveUsersCount)
router.get('/profile/:userid',isAuthenticated,getUserData)
router.put('/update/:userId',isAuthenticated,updateUserProfile)
router.get('/verify',verifyUser)
router.post('/verify-email',verifyEmail)
router.get('/referrals',isAuthenticated,getReferrals)
router.post('/forgetpassword',forgetPassword)
router.post('/payment-add',addPayment)

module.exports = router; 