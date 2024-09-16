const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
  console.log(email,otp)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      host: 'smtp.gmail.com',
      port: '587',
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS, 
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email, 
      subject: 'OTP for Verify User Email', 
      text: `Your OTP for Verify User is: ${otp}`,
    };
    try {
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error('Failed to send OTP email');
    }
  } catch (error) {
    throw new Error('Failed to send OTP email');
  }
};

module.exports = sendOTPEmail;