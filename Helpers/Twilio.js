const expressAsyncHandler = require('express-async-handler');
const twilio = require('twilio');
const UserModel = require('../Models/UserModel');
const { generateToken } = require('./JWT_Auth');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

exports.sendWhatsAppOTP = async (phoneNumber, otp) => {
    // const message = await client.messages.create({
    //     body: `Your verification code is: ${otp}`,
    //     from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
    //     to: `whatsapp:+91${phoneNumber}`  // User's WhatsApp number
    // });
    // console.log(message)
    // return message.sid;

    await client.messages
        .create({
            body: 'Your appointment is coming up on July 21 at 3PM',
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+918630162131'
        })
        .then(message => console.log(message.sid))
        .done();
}

exports.verifyWhatsappOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(404).send({
            success: false,
            message: "Please Provide OTP"
        })
    }

    try {
        const user = await UserModel.findOne({ phoneNumber })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            })
        }

        const comapreOtp = Number(otp) === user.whatsappVerificationOTP

        if (!comapreOtp) {
            return res.status(404).send({
                success: false,
                message: "Invalid OTP"
            })
        }

        await UserModel.findOneAndUpdate({ phoneNumber },
            {
                $set:
                {
                    isWhatsAppVerified: true,
                    whatsappVerificationExpiry: undefined,
                    whatsappVerificationOTP: undefined
                }
            }, { new: true })

        const token = generateToken(user._id);
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });

        await client.messages.create({
            body: `Otp verification Successfull!`,
            from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
            to: `whatsapp:+91${phoneNumber}`  // User's WhatsApp number
        });

        res.status(200).json({ success: true, message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Failed to verify OTP:', error.message);
        res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
    }
}

exports.sendOTPSMS = async (phoneNumber, code) => {
    try {
        await client.verify.v2.services("VAdac09b204df3a8ecced736a5359c4586")
            .verifications
            .create({ to: `whatsapp:+91${phoneNumber}`, channel: 'whatsapp' })
            .then(verification => console.log(verification.sid));
    } catch (error) {
        console.error('Failed to send message:', error.message);
    }
}

exports.verifyOTP = async (req, res) => {
    const { phoneNumber, code } = req.body;

    try {
        const verificationCheck = await client.verify.v2.services("VAdac09b204df3a8ecced736a5359c4586")
            .verificationChecks
            .create({ to: `+91${phoneNumber}`, code });

        if (verificationCheck.status === 'approved') {

            const user = await UserModel.findOne({ phoneNumber })

            await UserModel.findOneAndUpdate({ phoneNumber },
                {
                    $set:
                    {
                        isWhatsAppVerified: true,
                        whatsappVerificationExpiry: undefined,
                        whatsappVerificationOTP: undefined
                    }
                }, { new: true })

            const token = generateToken(user._id);
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000,
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            });

            res.status(200).json({ success: true, message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Failed to verify OTP:', error.message);
        res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
    }
};

exports.whatsappResponse = async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMessage = req.body.Body.toLowerCase();  // Convert message to lowercase
    const fromNumber = req.body.From;

    console.log(`Received message from ${fromNumber}: ${incomingMessage}`);

    // Respond based on the incoming message
    if (incomingMessage.includes('hello')) {
        twiml.message('Hello! How can I assist you today?');
    } else if (incomingMessage.includes('help')) {
        twiml.message('Sure! What do you need help with?');
    } else {
        twiml.message('Thank you for reaching out. We will get back to you soon.');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
};



