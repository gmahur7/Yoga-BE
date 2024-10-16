const { default: axios } = require("axios");

const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
const INTERAKT_API_URL = 'https://api.interakt.ai/v1/public/';

const createCampaign = async () => {
    try {
        const response = await axios.post('https://api.interakt.ai/v1/public/create-campaign/', {
            campaign_name: 'Harsh$ Test',
            campaign_type: 'PublicAPI',
            template_name: 'user_say_hii',
            language_code: 'en'
        }, {
            headers: {
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Campaign created:', response.data);
        return response.data.data.campaign_id
    } catch (error) {
        console.error('Error creating campaign:', error.response ? error.response.data : error.message);
    }
};

async function sendVerifyWhatsAppMessage(to, username) {
    const camp = createCampaign()
    try {
        const response = await axios.post(`${INTERAKT_API_URL}message/`, {
            "fullPhoneNumber": to,
            "campaignId": camp,
            "callbackData": "Whatasapp Verification Message",
            "type": "Template",
            "template": {
                "name": "verify_user",
                "languageCode": "en_GB",
                "headerValues": [
                    "https://app.tandenspine.io"
                ],
                "bodyValues": [
                    username,
                ],
                "buttonValues": {
                    0: [Number.parseInt(to)]
                },
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

async function whatsappVerificationSuccess(to, username) {
    const camp = createCampaign()
    try {
        const response = await axios.post(`${INTERAKT_API_URL}message/`, {
            "fullPhoneNumber": to,
            "campaignId": camp,
            "callbackData": "Whatasapp Verification Message",
            "type": "InteractiveList",
            "data": {
                "message": {
                    "type": "list",
                    "body": {
                        "text": "Hello " + username + ", Your Whatapp Verifiaction is successfull. Welcome to Tanden Spine. \n\n Thank You For Verification. \n \n Start your conversation by clicking the Hi button below."
                    },
                    "action": {
                        "button": "View Specializations",
                        "sections": [
                            {
                                "title": "Doctors Specializations",
                                "rows": [
                                    { "id": "specialization1", "title": "Back Pain",  },
                                    { "id": "specialization2", "title": "Shoulder Pain",  },
                                    { "id": "specialization3", "title": "Liver Problems",  },
                                    { "id": "specialization4", "title": "Heart Issues",  },
                                    { "id": "specialization5", "title": "Kidney Problems",  },
                                    { "id": "specialization6", "title": "Diabetes",  },
                                    { "id": "specialization7", "title": "Arthritis",  },
                                    { "id": "specialization8", "title": "Neurology",  },
                                    { "id": "specialization9", "title": "Skin Problems", }
                                ]
                            }
                        ]
                    }
                }
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

module.exports = {
    sendVerifyWhatsAppMessage,
    whatsappVerificationSuccess
}