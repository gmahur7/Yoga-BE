const express=require('express')
const { registerUser, authUser,forgetPassword,resetPassword,getUsers, verifyEmail, getUserData, logout, verifyUser, getReferrals, verifyWhatsAppOTP, updateUserProfile } = require('../Controllers/UserControllers')
const { isAuthenticated } = require('../Helpers/JWT_Auth')
// const { verifyOTP, verifyWhatsappOtp, whatsappResponse } = require('../Helpers/Twilio')
const router=express.Router()

router.route('/').post(registerUser).get(isAuthenticated,getUsers)
router.get('/profile/:userid',isAuthenticated,getUserData)
router.put('/update/:userId',isAuthenticated,updateUserProfile)
router.post('/login',authUser)
router.post('/logout',logout)
// router.post('/verify-whatsapp',verifyWhatsappOtp)
// router.post('/verify-otp',verifyOTP)
router.get('/verify-user',verifyUser)
router.post('/verify-email',verifyEmail)
router.get('/referrals',isAuthenticated,getReferrals)
router.post('/forgetpassword',forgetPassword)
router.post('/resetpassword/:resetToken',resetPassword)


// router.post('/response-whatsapp',whatsappResponse)

module.exports = router; 