const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, "Phone No. is required."],
        unique: true,
        trim: true,
        minLength: [10, "User Phone No. must be of 10 Digits."]
    },
    password: {
        type: String,
        required: [true, "Password. is required."],
    },

}, {
    timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
