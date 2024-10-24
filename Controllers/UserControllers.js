const asyncHandler = require("express-async-handler")
const bcrypt = require('bcryptjs')
const otpGenerator = require('otp-generator')
const User = require('../Models/UserModel')
const { generateToken } = require('../Helpers/JWT_Auth')
// const domain = process.env.DOMAIN || `http://localhost:${process.env.PORT}`
const domain = process.env.CLIENT_URL || "http://localhost:5173"
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/UserModel")
const sendOTPEmail = require("../Helpers/NodeMailer")
const QRCode = require('qrcode');
const path = require('path')
const { sendVerifyWhatsAppMessage, whatsappVerificationSuccess } = require("../Helpers/Interakt")
const qrcodeDir = path.join(__dirname, '../', 'qrcodes')

const genQRCode = (link, code) => {
    QRCode.toFile(`${qrcodeDir}/${code}_qrcode.png`, link, {
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function (err) {
        if (err) {
            console.error('Error occurred:', err);
        } else {
            console.log('QR code saved to qrcode.png');
        }
    });
}

const genCode = (user) => {
    const username = user.split("").filter((value) => value !== " ").join("");
    const randomStr = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const len = 5;

    let str = ""

    for (let i = 0; i < len; i++) {
        str += randomStr[Math.floor(Math.random() * randomStr.length)];
    }

    let output = username + "_" + str;

    return output
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, phoneNumber, password, referCode } = req.body

    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            message: "Phone No. is required"
        })
        // throw new Error("Please Enter All The Fields")
    }

    try {

        const referal = await User.findOne({ "refers.code": referCode })

        const userExits = await User.findOne({ phoneNumber })
        if (userExits) {
            return res.status(400).json({
                success: false,
                message: "Phone No. Already Exists"
            })
            // throw new Error("Email Already Exists")
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // const emailVerificationOTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        // const emailVerificationExpiry = Date.now() + 10 * 60 * 1000;

        // const whatsappVerificationOTP = otpGenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false });
        // const whatsappVerificationExpiry = Date.now() + 10 * 60 * 1000; 

        const code = genCode(username);

        const user = await User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            // whatsappVerificationOTP,
            // whatsappVerificationExpiry,
            // emailVerificationOTP,
            // emailVerificationExpiry,
            referBy: referal ? referal._id : null,
            refers: {
                code,
                points: 0,
                count: 0
            },
            isFirstLogin: true,
            isFirstPayment: true
        })


        if (user) {

            if (referal) {
                await User.updateOne(
                    { "refers.code": referCode }, // Filter condition
                    {
                        $inc: {
                            "refers.points": 10, // Increment points by 10
                            "refers.count": 1 // Increment count by 1
                        }
                    }
                );
            }

            //  await sendOTPSMS(phoneNumber, whatsappVerificationOTP);
            //  await sendWhatsAppOTP(phoneNumber, whatsappVerificationOTP);

            // const token = generateToken(user._id);
            // res.cookie('access_token', token, {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === 'production',  
            //     maxAge: 3600000,
            //     sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',   
            // });

            return res.status(201).json({
                success: true,
                message: "Verification OTP send successsfully"
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Failed To Register the user"
            })
            // throw new Error("Failed To Register the user")
        }
    } catch (error) {
        console.error("Server failed to register user: ", error.message)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { phoneNumber, name, code, countryCode, verificationDone } = req.body
    try {
        let user;
        user = await User.findOne({ phoneNumber: verificationDone ? phoneNumber : `${countryCode}${phoneNumber}` })
        const referal = await User.findOne({ "refers.code": code })

        if (!user) {
            const referCode = genCode(name);
            genQRCode(`${domain}/login/${referCode}#register`, referCode)

            // const whatsappVerificationToken = generateToken(phoneNumber)
            // console.log("wp: ",whatsappVerificationToken)

            user = await User.create({
                phoneNumber: `${countryCode}${phoneNumber}`,
                username: name,
                referBy: referal ? referal._id : null,
                refers: {
                    code: referCode,
                    points: 0,
                    count: 0
                },
                isFirstLogin: false,
                isFirstPayment: true,
                qrcode: referCode + "_qrcode.png",
                // whatsappVerificationToken
            })

            //send verification whatsapp message
            // const userPhoneNumber = user.phoneNumber.slice(1, user.phoneNumber)
            // sendVerifyWhatsAppMessage(userPhoneNumber, user.username)

            if (referal) {
                await User.updateOne(
                    { "refers.code": code }, // Filter condition
                    {
                        $inc: {
                            "refers.points": 10, // Increment points by 10
                            "refers.count": 1 // Increment count by 1
                        }
                    }
                );
            }

            return res.status(201).json({
                success: true,
                message: "Verify Whatsapp",
                user: user
            })
        }

        const userDetails = await UserModel.findById(user._id).select('-password')
        if (!user.isWhatsAppVerified) {
            return res.status(202).json({
                success: true,
                message: "Verify Whatsapp",
                user: userDetails
            })
        }

        const token = generateToken(user._id);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });

        // if (user.isFirstLogin && user.referBy) {
        //     await User.updateOne(
        //         { _id: user.referBy },
        //         { $inc: { "refers.points": 20 } }
        //     );

        //     await User.updateOne(
        //         { _id: user._id },
        //         { $set: { isFirstLogin: false } }
        //     );
        // }

        const refers = await UserModel.find({ referBy: user._id })
        const liveusers = (await UserModel.find()).length


        return res.status(200).json({
            success: true,
            message: "Login successfull",
            user: userDetails,
            token,
            referal: refers ? refers : [],
            count: liveusers,
            referBy: referal ? referal._id : null
        })

    } catch (error) {
        console.error("Error in login user: " + error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
})

const logout = (req, res) => {
    try {
        const token = req.cookies['access_token'];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token found' });
        }
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });

        return res.status(200).json({ success: true, message: 'Successfully logged out' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ success: false, message: 'Logout failed, please try again' });
    }
};

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({
            success: false,
            message: "Please provide an email address"
        });
        throw new Error("Please provide an email address");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found"
        });;
        throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${domain}/api/user/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendMail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(500).json({
            success: false,
            error: 'Email could not be sent'
        });
        throw new Error('Email could not be sent');
    }
});

const resetPassword = asyncHandler(async (req, res) => {

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400).json({
            success: false,
            message: "Invalid or expired reset token"
        });
        throw new Error("Invalid or expired reset token");
    }

    const { newPassword } = req.body;

    if (!newPassword) {
        res.status(400).json({
            success: false,
            message: "Please provide a new password"
        });
        throw new Error("Please provide a new password");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful"
    });
});

const getUsers = asyncHandler(async (req, res) => {

    try {
        const users = await UserModel.find({}).select("-password")
        const verified = await UserModel.find({ isWhatsAppVerified: true })

        return res.status(200).send({
            success: true,
            users,
            verified: verified.length
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            success: false,
            error: "server error"
        })
    }
})

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp, username } = req.body;

    try {
        if (!email || !otp || !username) {
            return res.send({
                success: false,
                error: "Please provide all fields"
            })
        }
        const user = await User.findOne({ email, username });

        if (!user) {
            return res.send({
                success: false,
                error: "User not found"
            })
        }

        const parsedOtp = Number.parseInt(otp);

        if (user.emailVerificationOTP !== parsedOtp) {
            return res.status(400).send({
                success: false,
                error: "Invalid OTP"
            });
        }

        if (user.emailVerificationExpiry <= Date.now()) {
            return res.send({
                success: false,
                error: "OTP Expired"
            })
        }
        await User.updateOne(
            { _id: user._id },
            {
                $set:
                {
                    isEmailVerified: true
                }
            }, {
            new: true
        }
        );


        await User.updateOne(
            { _id: user._id },
            {
                $unset: {
                    emailVerificationOTP: "", emailVerificationExpiry: ""
                }
            }
        );

        const updatedUser = await User.findById(user._id)

        const token = await generateToken(updatedUser._id)

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });


        res.status(200).json({
            success: true,
            msg: 'OTP verified successfully',
            user: updatedUser,
            auth_token: token
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
})

const getUserData = asyncHandler(async (req, res) => {
    const { userid } = req.params;
    if (!userid) {
        return res.status(400).send({
            success: false,
            error: "Please Provide User Id"
        })
    }

    try {
        const user = await User.findById(userid).select('-password');
        if (!user) {
            return res.status(404).send({
                success: false,
                error: "User Not Found"
            })
        }

        return res.status(200).send({
            success: true,
            user: user
        })

    } catch (error) {
        console.error("Error in getting user data: ", error)
        res.status(400).send({
            success: false,
            error: "Error in getting user data: " + error
        })
    }
})

const verifyUser = async (req, res) => {
    let token;
    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    }
    // console.log("token: ",token)
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        return res.status(200).json({ success: true, user: user });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: 'Invalid token.' });
    }
};

const getReferrals = asyncHandler(async (req, res) => {

    const currentUser = req.user;
    if (!currentUser) {
        return res.status(404).send({
            success: false,
            error: "Current user not found"
        })
    }

    try {
        const users = await User.find({
            referBy: currentUser._id
        }).select("-password")

        if (!users.length > 0) {
            return res.status(404).send({
                success: false,
                error: "No Referrals Found"
            })
        }

        return res.status(200).send({
            success: true,
            users: users,
            points: currentUser.refers.points
        })

    } catch (error) {
        console.error("Error in getting referrals user data: ", error)
        res.status(400).send({
            success: false,
            error: "Error in getting referrals user data: " + error
        })
    }
})

const getLiveUsersCount = asyncHandler(async (req, res) => {

    try {
        const users = await User.find()

        if (!users.length > 0) {
            return res.status(404).send({
                success: false,
                error: "No Live Users Found"
            })
        }

        return res.status(200).send({
            success: true,
            count: users.length
        })

    } catch (error) {
        console.error("Error in getting live user count: ", error)
        res.status(400).send({
            success: false,
            error: "Error in getting live user count: " + error
        })
    }
})

const verifyUserWithWhatsApp = async (req, res) => {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            message: "Phone Number is required"
        });
    }

    try {
        const user = await User.findOne({ phoneNumber: `+${phoneNumber}` });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isWhatsAppVerified) {
            return res.redirect('https://app.tandenspine.io')
        }

        user.isWhatsAppVerified = true
        await user.save()

        //send verification whatsapp message
        const userPhoneNumber = user.phoneNumber.slice(1, user.phoneNumber)
        whatsappVerificationSuccess(userPhoneNumber, user.username)

        return res.redirect('https://app.tandenspine.io')

    } catch (error) {
        console.error("Error in verify User WhatsApp:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const verifyWhatsAppOTP = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({
            success: false,
            message: "Phone Number and OTP are required"
        });
    }

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if the OTP is valid and not expired
        if (user.whatsappVerificationOTP !== Number(otp) || user.whatsappVerificationExpiry <= Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Mark the user as verified and remove OTP from the database
        user.isWhatsAppVerified = true;
        user.whatsappVerificationOTP = undefined;
        user.whatsappVerificationExpiry = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User verified successfully"
        });

    } catch (error) {
        console.error("Error verifying WhatsApp OTP:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP. Please try again."
        });
    }
};

const updateUserProfile = async (req, res) => {
    const { username, dob, gender, city, state, country } = req.body;
    const userId = req.params.userId;

    if (!userId) {
        return res.status(404).json({
            success: false,
            message: 'User not found!'
        });
    }

    if (!username || !dob || !gender || !city || !state || !country) {
        return res.status(404).json({
            success: false,
            message: 'Please provide all details!'
        });
    }

    try {

        // Update user information
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, dob, gender, city, state, country },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        const user = await UserModel.findById(userId).select("-password")
        const refers = await UserModel.find({ referBy: user._id })

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: user,
            referal: refers ? refers : []
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'Server error!' });
    }
};

const markAttendance = async (req, res) => {
    const { toMarkDate, user } = req.body;
    const currentUser = req.user || user;

    if (!currentUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found!'
        });
    }

    if (!toMarkDate) {
        return res.status(404).json({
            success: false,
            message: 'Attendance date to mark not found'
        });
    }

    try {

        const dateStr = toMarkDate;
        const date = new Date(dateStr);
        const formattedDate = date.toISOString().replace('Z', '+00:00');
        const isoDate = new Date(formattedDate);

        const update = await UserModel.findByIdAndUpdate(
            currentUser._id,
            {
                $push: {
                    attendence: isoDate
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        if (!update) {
            return res.status(400).json({
                success: false,
                message: "Attendance marked failed!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Attendance marked successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}



module.exports = {
    registerUser,
    authUser,
    logout,
    forgetPassword,
    resetPassword,
    getUsers,
    verifyEmail,
    getUserData,
    verifyUser,
    getReferrals,
    verifyUserWithWhatsApp,
    verifyWhatsAppOTP,
    updateUserProfile,
    getLiveUsersCount,
    markAttendance
}