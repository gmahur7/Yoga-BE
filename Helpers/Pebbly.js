const axios = require('axios');

const pabblyWebhookUrl = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTZkMDYzZjA0Mzc1MjY4NTUzMzUxMzIi_pc'; // The webhook URL from Pabbly

const sendDataToPabbly = async (data) => {
  try {
    const response = await axios.post(pabblyWebhookUrl, data);
    console.log('Data sent successfully to Pabbly:', response.data);
  } catch (error) {
    console.error('Error sending data to Pabbly:', error);
  }
};

// Example data to send


module.exports = {
    sendDataToPabbly
}
