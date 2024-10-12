const { default: axios } = require("axios");

const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
const INTERAKT_API_URL = 'https://api.interakt.ai/v1/public/';

const createCampaign = async () => {
    try {
      const response = await axios.post('https://api.interakt.ai/v1/public/create-campaign/', {
        campaign_name: 'Harsh3 Test',
        campaign_type: 'PublicAPI',
        template_name: 'verify_user',
        language_code: 'en_GB'
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
  
async function sendVerifyWhatsAppMessage(to, username) {
    const camp = createCampaign()
    try {
      const response = await axios.post(`${INTERAKT_API_URL}message/`, {
        "fullPhoneNumber": to,
        "campaignId" : camp,
        "callbackData": "Whatasapp Verification Message",
        "type": "Template",
        "template": {
            "name": "verify_user",
            "languageCode": "en_GB",
            "headerValues": [
              "https://app.tandenspine.io"
          ],
          "bodyValues": [
            username,to
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

module.exports = {
    sendVerifyWhatsAppMessage
}