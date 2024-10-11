const express = require('express')
const { registerUser, authUser, forgetPassword, resetPassword, getUsers, verifyEmail, getUserData, getLiveUsersCount, logout, verifyUser, getReferrals, updateUserProfile, markAttendance } = require('../Controllers/UserControllers')
const { isAuthenticated } = require('../Helpers/JWT_Auth')
const { sendDataToPabbly } = require('../Helpers/Pebbly')
const { default: axios } = require('axios')
const router = express.Router()
const { v4: uuidv4 } = require('uuid');

const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
const INTERAKT_API_URL = 'https://api.interakt.ai/v1/public/';

router.route('/').post(registerUser).get(isAuthenticated, getUsers)
router.post('/login', authUser)
router.post('/logout', logout)

router.get('/live-users-count', getLiveUsersCount)
router.get('/profile/:userid', isAuthenticated, getUserData)
router.put('/update/:userId', isAuthenticated, updateUserProfile)
router.get('/verify', verifyUser)
router.get('/referrals', isAuthenticated, getReferrals)
router.post('/forgetpassword', forgetPassword)

router.route('/mark-attendance').post(isAuthenticated,markAttendance)


const createCampaign = async () => {
  try {
    const response = await axios.post('https://api.interakt.ai/v1/public/create-campaign/', {
      campaign_name: 'Harsh3 Test',
      campaign_type: 'PublicAPI',
      template_name: 'day_2_started_29_sept',
      language_code: 'en'
    }, {
      headers: {
        'Authorization': `Basic ${INTERAKT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Campaign created:', response.data);
    return response.data.data. campaign_id
  } catch (error) {
    console.error('Error creating campaign:', error.response ? error.response.data : error.message);
  }
};

async function sendWhatsAppMessage(to, message) {
  const camp = createCampaign()
  console.log(`91${to}`)
  try {
    const response = await axios.post(`${INTERAKT_API_URL}message/`, {
      // "countryCode": "+91",
      // "phoneNumber": "7017308602",
      "fullPhoneNumber": `91${to}`, // Optional, Either fullPhoneNumber or phoneNumber + CountryCode is required
      "campaignId" : camp, // Not Mandatory
      "callbackData": "some text here",
      "type": "Template",
      "template": {
          "name": "day_2_started_29_sept",
          "languageCode": "en",
          "headerValues": [
            "https://app.tandenspine.io"
        ],
        "bodyValues": [
            to
        ]
      }
  }, {
      headers: {
        'Authorization': `Basic ${INTERAKT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}

router.post('/verify-whatsapp', async (req, res) => {
  console.log("hii")
  await sendWhatsAppMessage(req.body.phoneNumber, "Hello From intrackt and nodejs")
  res.status(200).send({
    success:true,
  })
})

module.exports = router; 