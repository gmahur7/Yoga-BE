const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    ques: {
        type: String,
        required: [true, "Question is required."],
        unique: true,
        trim: true,
    },
    ans: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "Answer is required."],
    },
    lang:{
        type:String,
        required: [true, "Language is required."],
    }

}, {
    timestamps: true
});

const FAQ = mongoose.model("Faq", faqSchema);
module.exports = FAQ;
