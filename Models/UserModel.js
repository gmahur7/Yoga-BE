const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: [true, "Username is required."],
        // unique: true,
        trim: true,
        // minLength: [4, "Username must be greater than or equal to 4 characters."]
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone No. is required."],
        unique: true,
        trim: true,
        minLength: [10, "User Phone No. must be of 10 Digits."]
    },
    password: {
        type: String,
        // required: [true, "User Password is required."]
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    dob: {
        type: String,
    },
    gender: {
        type: String,
    },
    qrcode: {
        type: String,
    },
    attendence: [],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isWhatsAppVerified: {
        type: Boolean,
        default: false
    },
    refers: {
        code: {
            type: String,
            required: true
        },
        points: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    referBy: {
        type: mongoose.Schema.Types.ObjectId || null,
        ref: 'User',
        default: null
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    isFirstPayment: {
        type: Boolean,
        default: true
    },
    paymentType: {
        type: String,
        default: 'Free',
    },
    paymentDate: {
        type: Date,
        default: Date.now(),
    },
    nextPaymentDate: {
        type: Date,
        default: function () {
            const now = new Date();
            now.setDate(now.getDate() + 7);
            return now;
        },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
