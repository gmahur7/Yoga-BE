const mongoose = require('mongoose')

const meetSchema = new mongoose.Schema({
    meeturl: {
        type: String,
        required: true,
    },
    meetdate:Date,
    meetname: { type:String },
    category: { type:String },
}, {
    timestamps: true,
})

const MeetModel = new mongoose.model('meets', meetSchema)

module.exports = MeetModel;