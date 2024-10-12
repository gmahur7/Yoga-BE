const express = require('express')
const { registerUser, authUser, forgetPassword, resetPassword, getUsers, verifyEmail, getUserData, getLiveUsersCount, logout, verifyUser, getReferrals, updateUserProfile, markAttendance, verifyUserWithWhatsApp } = require('../Controllers/UserControllers')
const { isAuthenticated } = require('../Helpers/JWT_Auth')
const router = express.Router()

router.route('/').post(registerUser).get(isAuthenticated, getUsers)

// to login, signup, logout and verify user
router.post('/login', authUser)
router.post('/logout', logout)
router.get('/verify', verifyUser)

// to verify whatsapp using whatsapp verify button click
router.get('/verify-whatsapp/:phoneNumber',verifyUserWithWhatsApp)

// retrieve all users
router.get('/live-users-count', getLiveUsersCount)

// user profile retrieve and update
router.get('/profile/:userid', isAuthenticated, getUserData)
router.put('/update/:userId', isAuthenticated, updateUserProfile)

// get referral of specific user
router.get('/referrals', isAuthenticated, getReferrals)

// mark attendence of user
router.route('/mark-attendance').post(isAuthenticated,markAttendance)

// user forget password
router.post('/forgetpassword', forgetPassword)

module.exports = router; 